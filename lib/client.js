/*
* @Author: dm.yang
* @Date:   2015-04-03 19:43:15
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-03 21:28:40
*/

'use strict';

var _ = require('lodash');
var utils = require('./utils');
var clientsMgr = require('../lib/clients_manager');
var logger = require('../helpers/logger').rpc;

module.exports = Client;

function Client(sock) {
    if(!(this instanceof Client)) return new Client(sock);

    var rHost = sock.remoteAddress;
    var rPort = sock.remotePort;
    var cid = utils.md5([rHost, rPort].join(':'));

    sock.on('error', onSockError.bind(this);

    sock.on('close', onSockClose.bind(this));

    sock.on('data', sockDataHandle.bind(this));

    this.id = cid;
    this.host = rHost;
    this.port = rPort;
    this.socket = sock;

    this.send({cmd: 'init', id: id});

    return this;
};

_.assign(Client.prototype, {
    send: function(data) {
        var msg = JSON.stringify(data);

        this.socket.write(msg, 'utf8');
        logger.info('send msg:%s to %s:%s', msg, this.host, this.port);
    },

    setBrowserSocket: function(socket) {
        this._browserSocket = socket;
    },

    disconnect: function() {
        this.socket.destroy();
        logger.info('client id:%s %s:%s closed manually', this.id, this.host, this.port);
    }
});

function onSockError(err) {
    logger.error(err);
};

function onSockClose() {
    clientsMgr.del(this.id);
    logger.info('client id:%s %s:%s closed manually', this.id, this.host, this.port);
};

function sockDataHandle(data) {
    try {
        data = data.toString('utf8');
        logger.info('received data:%s from %s', data, cid);
        data = JSON.parse(data);
    } catch(e) {
        return logger.error(e);
    }

    var sock = this.socket;
    var cmd = data.cmd;
    var clientId = data.clientId;
    var bSock = this._browserSocket;

    if(clientId !== this.id) {
        if(bSock) bSock.emit('client:output', {clientId: clientId, code: 200, output: data.output});
        logger.warn('client id:%s not assigned', clientId);
        return;
    }

    if(bSock) bSock.emit('client:output', {clientId: clientId, code: 200, output: data.output});
};
