/*
* @Author: dm.yang
* @Date:   2015-04-03 18:29:55
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-03 21:17:54
*/

'use strict';

var clientsMgr = require('../lib/clients_manager');
var logger = require('../helpers/logger').socket;

module.exports = function(io) {
    io.on('connection', onConn);
};

function onConn(sock) {
    sock.on('cmd:input', onSockInput.bind({socket: sock}));
    sock.on('disconnect', onSockDisconnect.bind({socket: sock}));
};

function onSockInput(cmd) {
    var socket = this.socket;
    var cid = cmd.clientId;
    var client = clientsMgr.getClientById(cid);

    if(!client) {
        var msg = 'Client Not Found.'
        socket.emit('cmd:output', {clientId: cid, code: 404, msg: msg});
        logger.warn(msg);
        return;
    }

    delete data.clientId;
    // 此时，client.socket和this.socket建立会话
    client.setBrowserSocket(socket);
    client.send(data);
};

function onSockDisconnect() {
    var socket = this.socket;
};
