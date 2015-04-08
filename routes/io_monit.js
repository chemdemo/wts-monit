/*
* @Author: dm.yang
* @Date:   2015-04-03 18:29:55
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-08 12:01:14
*/

'use strict';

var _ = require('lodash');

var clientsMgr = require('../lib/clients_manager');
var logger = require('../helpers/logger').web;

module.exports = onConn;

function onConn(sock) {
    var onClientOnline = _onClientOnline.bind({socket: sock});
    var onClientRemove = _onClientRemove.bind({socket: sock});

    // @see cli/client.js
    clientsMgr.on('client:online', onClientOnline);

    clientsMgr.on('client:destroy', onClientRemove);

    sock.on('client:destroy', clientsMgr.removeClient.bind(clientsMgr));

    sock.on('disconnect', function() {
        clientsMgr.removeListener('client:online', onClientOnline);
        clientsMgr.removeListener('client:destroy', onClientRemove);
    });
};

/*function _onClientAdd(cid) {
    var sock = this.socket;

    logger.info('client %s created', cid);
    sock.emit('client:add', {clientId: cid, group: {}});
};*/

function _onClientOnline(cid) {
    var sock = this.socket;
    var client = clientsMgr.getClientById(cid);

    logger.info('client %s online', cid);
    sock.emit('client:add', {clientId: cid, group: clientsMgr.getGroup()});
};

function _onClientRemove(cid) {
    var sock = this.socket;

    logger.info('client %s destroy', cid);
    sock.emit('client:destroy', {clientId: cid, group: clientsMgr.getGroup()});
};
