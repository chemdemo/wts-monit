/*
* @Author: dm.yang
* @Date:   2015-04-03 16:29:45
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-05 21:56:43
*/

'use strict';

var fs = require('fs');
var _ = require('lodash');

var clientsMgr = require('../lib/clients_manager');

exports.route = function(app) {
    app.get('/', function* () {
        var map = clientsMgr.clientMap;

        map = _.groupBy(map, function(client) {
            return client.group;
        });

        yield this.render('index', {group: map});
    });

    app.get('/term/:clientId/:termId', function* () {
        var cid = this.params['clientId'];
        var tid = this.params['termId'];
        var client = clientsMgr.getClientById(cid);

        yield this.render('term', {host: client.host, port: client.port, clientId: client.id, termId: tid});
    });

    app.post('/client/destroy/:clientId', function* () {
        var cid = this.params['clientId'];

        if(clientsMgr.removeClient(cid)) this.body = {code: 0};
        else this.body = {code: 1};
    });
};

