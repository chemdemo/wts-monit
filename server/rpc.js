/*
* @Author: dm.yang
* @Date:   2015-04-03 19:01:26
* @Last Modified by:   chemdemo
* @Last Modified time: 2015-04-08 03:03:29
*/

'use strict';

var net = require('net');

var conf = require('../conf').rpcServer;
var clientsMgr = require('../lib/clients_manager');
var logger = require('../helpers/logger').rpc;

var server;

exports.start = function() {
    createRpcServer(conf.port, conf.host);
};

function createRpcServer(port, host) {
    server = new net.Server();

    server.on('error', onSvrError);

    server.on('close', onSvrClose);

    server.on('connection', onConnection);

    listen();
};

function onSvrError(err) {
    logger.error(err);
};

function onSvrClose() {
    logger.error('Server closed');
    setTimeout(listen, 1000);
};

function onConnection(sock) {
    clientsMgr.addClient(sock);
};

function listen() {
    server.listen(conf.port, conf.host, function() {
        logger.info('Server running at %s:%s', conf.host, conf.port);
    });
};
