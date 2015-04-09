/*
* @Author: dm.yang
* @Date:   2014-12-17 17:51:48
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-09 16:00:09
*/

'use strict';

var fs = require('fs');
var _ = require('lodash');
var colors = require('colors/safe');
var log4js = require('log4js');

var conf = require('../conf');

var loggerConf = conf.logger;
var isDev = conf.isDev;

if(!fs.existsSync(loggerConf.root)) fs.mkdirSync(loggerConf.root);

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

log4js.configure(loggerConf.options, {
    cwd: loggerConf.root
});

Object.keys(loggerConf.options.levels).forEach(function(key) {
    var logger = log4js.getLogger(key);

    if(isDev) hook(key, logger);

    exports[key] = logger;
});

function hook(type, logger) {
    var methods = ['debug', 'info', 'warn', 'error'];

    _.each(methods, function(method) {
        var _method = logger[method];

        logger[method] = function() {
            var args = [].slice.call(arguments, 0);

            args[0] = colors[method](args[0]);
            console.log.apply(this, args);
            // _method();
        };
    });
};
