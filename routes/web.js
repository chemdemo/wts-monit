/*
* @Author: dm.yang
* @Date:   2015-04-03 16:29:45
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-03 16:31:16
*/

'use strict';

var fs = require('fs');

exports.route = function(app) {
    app.get('/', function() {
        this.body = fs.createReadStream('../public/index.html');
    });
};

