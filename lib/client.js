/*
* @Author: dm.yang
* @Date:   2015-04-03 19:43:15
* @Last Modified by:   chemdemo
* @Last Modified time: 2015-04-09 12:17:20
*/

'use strict';

// remote client

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var ProtoBuf = require('protobufjs');

var utils = require('./utils');
var clientsMgr = require('../lib/clients_manager');
var logger = require('../helpers/logger').rpc;

var builder = ProtoBuf.loadProtoFile(path.resolve(__dirname, '../conf/socket.proto'));
var Proto = builder.build('Socket');
var Input = Proto.Input;
var Output = Proto.Output;

module.exports = Client;

function Client(sock, group) {
    if(!(this instanceof Client)) return new Client(sock, group);

    var rHost = sock.remoteAddress;
    var rPort = sock.remotePort;
    var cid = utils.md5([rHost, rPort].join(':')).slice(0, 5);

    // just write buffer
    // sock.setEncoding('utf8');

    sock.on('error', onSockError.bind(this));

    sock.on('close', onSockClose.bind(this));

    sock.on('data', sockDataHandle.bind(this));

    this.id = cid;
    this.host = rHost;
    this.port = rPort;
    this.status = 'ready';
    this.group = group;
    this._terms = {};
    this.socket = sock;

    this.sendMsg({cmd: 'client:ready', clientId: cid});

    return this;
};

_.assign(Client.prototype, {
    sendMsg: function(msg) {
        logger.info('send msg:%s to %s:%s', JSON.stringify(msg), this.host, this.port);
        
        var input = new Input(msg);
        this.socket.write(input.toBuffer());
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

    clientsMgr.removeClient(this.id);
};

function sockDataHandle(data) {
    try {
        data = Output.decode(data);
    } catch(e) {
        this.sendMsg({cmd: 'client:error', code: 1});
        logger.error(e.stack);
        return;
    }

    var cmd = data.cmd;
    var cid = data.clientId;
    var tid = data.termId;
    var termSock = this.getTerm(tid);

    logger.debug('received data:%s from %s:%s', JSON.stringify(data), this.host, this.port);

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
            clientsMgr.emit('client:online', this.id);
            break;

        case 'client:conf':
            var conf = data.conf;

            if('group' in conf) this.group = conf.group;
            delete conf.group;
            this.conf = conf;
            break;

        case 'client:output':
            if(termSock) termSock.emit('client:output', data.output);
            break;

        default: logger.warn('Nothing done');
    }
};

// merge multi msg
/*function parseMsg(msg) {
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
};*/
