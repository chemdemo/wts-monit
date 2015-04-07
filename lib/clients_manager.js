/*
* @Author: dm.yang
* @Date:   2015-04-03 15:45:17
* @Last Modified by:   chemdemo
* @Last Modified time: 2015-04-08 02:16:29
*/

'use strict';

var events = require('events');
var util = require('util');
var _ = require('lodash');

var logger = require('../helpers/logger').rpc;
var _clientMap = {};

function Manager() {
    events.EventEmitter.call(this);

    return this;
};

util.inherits(Manager, events.EventEmitter);

_.assign(Manager.prototype, {
    addClient: function(sock, group) {
        group = group || 'default';

        var Client = require('./client');
        var client = Client(sock, group);

        _clientMap[client.id] = client;
        logger.info('client:%s created', client.id);

        // this.emit('client:add', client.id);

        return client;
    },

    getGroup: function() {
        var group = {};

        _.each(_clientMap, function(client, cid) {
            var groupName = client.group;

            if(!(groupName in group)) {
                group[groupName] = [];
            }

            group[groupName].push({
                id: client.id,
                host: client.host,
                port: client.port,
                status: client.status,
                group: groupName,
                conf: client.conf || {}
            });
        });

        return group;
    },

    getClientById: function(id) {
        return _clientMap[id];
    },

    removeClient: function(id) {
        var client = this.getClientById(id);

        if(client) {
            client.destroy();
            delete _clientMap[id];
            this.emit('client:destroy', id);
            logger.warn('client:%s destroy', id);
            return true;
        }

        return false;
    },

    removeAll: function() {
        _clientMap = {};
        this.emit('client:clean');
        logger.warn('clean all clients');
        return true;
    }
});

module.exports = new Manager();
