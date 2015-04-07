/*
* @Author: dm.yang
* @Date:   2015-04-03 19:43:15
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-07 21:32:30
*/

'use strict';

// remote client

var JsonSocket = require('json-socket');

var _ = require('lodash');
var utils = require('./utils');
var clientsMgr = require('../lib/clients_manager');
var logger = require('../helpers/logger').rpc;

module.exports = Client;

function Client(sock, group) {
    if(!(this instanceof Client)) return new Client(sock, group);

    sock = JsonSocket(sock);

    var rHost = sock.remoteAddress;
    var rPort = sock.remotePort;
    var cid = utils.md5([rHost, rPort].join(':')).slice(0, 5);

    sock.on('error', onSockError.bind(this));

    sock.on('close', onSockClose.bind(this));

    // sock.on('data', sockDataHandle.bind(this));
    sock.on('message', onSockMsg.bind(this));

    this.id = cid;
    this.host = rHost;
    this.port = rPort;
    this.status = 'ready';
    this.socket = sock;
    this.group = group;
    this._terms = {};

    this.sendMsg({cmd: 'client:ready', clientId: cid});

    return this;
};

_.assign(Client.prototype, {
    sendMsg: function(msg) {
        msg = JSON.stringify(msg);

        this.socket.write(msg, 'utf8');
        logger.info('send msg:%s to %s:%s', msg, this.host, this.port);
    },

    addTerm: function(termId, socket) {
        this._terms[termId] = socket;
        logger.info('add term:%s', termId);
    },

    getTerm: function(termId) {
        return this._terms[termId];
    },

    removeTerm: function(termId) {
        delete this._terms[termId];
        this.sendMsg({cmd: 'term:destroy', termId: termId});
        logger.info('remove term:%s', termId);
    },

    destroy: function() {
        // this.socket.destroy();
        this.sendMsg({cmd: 'client:destroy'});
        logger.info('client id:%s %s:%s closed manually', this.id, this.host, this.port);
    }
});

function onSockError(err) {
    logger.error(err);
};

function onSockClose() {
    var self = this;

    _.each(this._terms, function(termSock, tid) {
        termSock.emit('client:destroy');
        logger.info('destroy term:%s', tid);
    });
    delete clientsMgr.clientMap[this.id];

    logger.info('client id:%s %s:%s closed manually', this.id, this.host, this.port);
};

function sockDataHandle(msg) {
    msg = msg.toString('utf8');

    logger.info('received msg:%s from %s:%s', msg, this.host, this.port);

    msg = parseMsg(msg);

    if(msg instanceof Error) {
        this.sendMsg({cmd: 'client:error', code: 1});
        logger.error(msg);
        return;
    }

    var sock = this.socket;
    var cmd = msg.cmd;
    var cid = msg.clientId;
    var tid = msg.termId;
    var termSock = this.getTerm(tid);

    if(!cmd) {
        this.sendMsg({cmd: 'client:error', code: 2});
        logger.warn('client id:%s has not assigned', cid);
        return;
    }

    if(!cid) {
        this.sendMsg({cmd: 'client:error', code: 3});
        logger.warn('client id:%s has not assigned', cid);
        return;
    }

    if(cid !== this.id) {
        this.sendMsg({cmd: 'client:error', code: 4});
        logger.warn('client id:%s has not assigned', cid);
        return;
    }

    switch(cmd) {
        case 'client:online':
            this.status = 'online';
            if('group' in msg) this.group = msg.group;
            if('conf' in msg && Object.keys(msg.conf).length) this.conf = msg.conf;
            break;

        case 'client:output':
            if(termSock) termSock.emit('client:output', msg.output);
            break;

        default: logger.info('Nothing done');
    }
};

function onSockMsg(msg) {
    var cmd = msg.cmd;
    var cid = msg.clientId;
    var tid = msg.termId;
    var termSock = this.getTerm(tid);

    if(!cmd) {
        this.sendMsg({cmd: 'client:error', code: 2});
        logger.warn('client id:%s has not assigned', cid);
        return;
    }

    if(!cid) {
        this.sendMsg({cmd: 'client:error', code: 3});
        logger.warn('client id:%s has not assigned', cid);
        return;
    }

    if(cid !== this.id) {
        this.sendMsg({cmd: 'client:error', code: 4});
        logger.warn('client id:%s has not assigned', cid);
        return;
    }

    switch(cmd) {
        case 'client:online':
            this.status = 'online';
            if('group' in msg) this.group = msg.group;
            if('conf' in msg && Object.keys(msg.conf).length) this.conf = msg.conf;
            break;

        case 'client:output':
            if(termSock) termSock.emit('client:output', msg.output);
            break;

        default: logger.info('Nothing done');
    }
};

// merge multi msg
function parseMsg(msg) {
    try {
        var r = {};

        msg.replace(/(\{[^\}]+\})?/g, function(m, $1) {
            if($1) {
                $1 = JSON.parse($1);

                if(!r.output) r = $1;
                else r.output += $1.output;
            }
        });

        return r;
    } catch(e) {
        return e;
    }
};
