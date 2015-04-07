/*
* @Author: dm.yang
* @Date:   2015-04-03 15:45:17
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-07 11:18:52
*/

'use strict';

var Client = require('./client');

var clientMap = exports.clientMap = {};

exports.addClient = addClient;
exports.getClientById = getClient;
exports.removeClient = delClient;

function addClient(sock, group) {
    group = group || 'default';

    var client = Client(sock, group);

    clientMap[client.id] = client;

    return client;
};

function getClient(id) {
    return clientMap[id];
};

function delClient(id) {
    var client = getClient(id);

    if(client) {
        client.destroy();
        return delete clientMap[id];
    }

    return false;
};
