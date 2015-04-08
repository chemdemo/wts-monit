/*
* @Author: dm.yang
* @Date:   2015-04-03 16:29:45
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-08 12:18:55
*/

'use strict';

var fs = require('fs');
var path = require('path');
var gzip = require('koa-gzip');
var _ = require('lodash');

var clientsMgr = require('../lib/clients_manager');
var clientTmplPath = path.resolve(__dirname, '../view/client-list.html');

exports.route = function(app) {
    app.get('/', function* () {
        yield this.render('index', {group: clientsMgr.getGroup()});
    });

    app.get('/tmpl/list', gzip(), function* () {
        this.body = fs.createReadStream(clientTmplPath);
    });

    app.get('/term/:clientId/:termId', function* () {
        var cid = this.params['clientId'];
        var tid = this.params['termId'];
        var client = clientsMgr.getClientById(cid);

        yield this.render('term', {host: client.host, port: client.port, clientId: client.id, termId: tid});
    });

    /*app.post('/client/destroy/:clientId', function* () {
        var cid = this.params['clientId'];

        if(clientsMgr.removeClient(cid)) this.body = {code: 0};
        else this.body = {code: 1};
    });*/
};

