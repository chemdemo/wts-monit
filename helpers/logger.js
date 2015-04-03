/*
* @Author: dm.yang
* @Date:   2014-12-17 17:51:48
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-03 16:08:47
*/

'use strict';

var fs = require('fs');
var log4js = require('log4js');
var conf = require('../conf').logger;

if(!fs.existsSync(conf.root)) fs.mkdirSync(conf.root);

log4js.configure(conf.options, {
    cwd: conf.root
});

Object.keys(conf.options.levels).forEach(function(key) {
    exports[key] = log4js.getLogger(key);
});
