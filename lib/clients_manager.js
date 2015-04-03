/*
* @Author: dm.yang
* @Date:   2015-04-03 15:45:17
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-03 21:29:24
*/

'use strict';

var Client = require('./Client');

var clients = exports.clients = {};

exports.addClient = addClient;
exports.getClientById = getClient;
exports.removeClient = delClient;

function addClient(sock) {
    var client = Client(sock);

    clients[client.id] = client;

    return client;
};

function getClient(id) {
    return clients[id];
};

function delClient(id) {
    var client = getClient(id);

    if(client) {
        client.disconnect();
        return delete clients[id];
    }

    return false;
};
