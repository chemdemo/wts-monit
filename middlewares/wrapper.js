/*
* @Author: dm.yang
* @Date:   2014-12-19 18:23:26
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-01-08 16:40:02
*/

'use strict';

var pkg = require('../package.json');
var logger = require('../helpers/logger').web;

module.exports = function(app) {
    return function* (next) {
        var start = new Date;
        yield next;
        var t = new Date - start;
        logger.info('%s %s - %sms', this.method, this.url, t);
        this.set('X-Powered-By', pkg.name);
        this.set('X-Response-Time', t + 'ms');
    };
};
