/*
* @Author: dm.yang
* @Date:   2015-04-03 18:29:55
* @Last Modified by:   chemdemo
* @Last Modified time: 2015-04-07 23:24:56
*/

'use strict';

var _ = require('lodash');

var clientsMgr = require('../lib/clients_manager');
var logger = require('../helpers/logger').socket;

// exports.route = function(io) {
//     io.of('/term').on('connection', onConn);
// };
module.exports = onConn;

function onConn(sock) {
    sock.on('term:online', onSockOnline.bind({socket: sock}));
    sock.on('term:input', onSockInput.bind({socket: sock}));
    sock.on('disconnect', onSockDisconnect.bind({socket: sock}));
    sock.on('error', onSockError.bind({socket: sock}));
};

// create session between term and remote client
// maybe use socket.io session is better
function onSockOnline(clientId, termId) {
    var socket = this.socket;
    var client = clientsMgr.getClientById(clientId);

    socket.clientId = clientId;
    socket.termId = termId;
    if(client) client.addTerm(termId, socket);
};

function onSockInput(data) {
    var socket = this.socket;
    var cid = socket.clientId;
    var termId = socket.termId;
    var client = clientsMgr.getClientById(cid);

    if(!client) {
        var output = 'Client Not Found.'
        socket.emit('client:output', output);
        logger.warn(output);
        return;
    }

    client.sendMsg({cmd: 'term:input', termId: termId, input: data});
};

function onSockError(err) {
    logger.error(err.stack);
};

function onSockDisconnect() {
    var socket = this.socket;
    var client;

    logger.info('socket disconnect');

    if(socket) {
        client = clientsMgr.getClientById(socket.clientId);
        if(client) client.removeTerm(socket.termId);
    }
};
