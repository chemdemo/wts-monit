/*
* @Author: dm.yang
* @Date:   2015-04-03 16:17:50
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-05 19:49:22
*/

'use strict';

var path = require('path');
var http = require('http');
var koa = require('koa');
var io = require('socket.io');
var terminal = require('term.js');
var router = require('koa-router');
var ejs = require('koa-ejs');
var serve = require('koa-static');
var koaLogger = require('koa-logger');

var rpcServer = require('./rpc');
var logger = require('../helpers/logger').web;

var pkg = require('../package.json');
var conf = require('../conf');

var webConf = conf.webServer;
var isDev = conf.isDev;
var app = koa();
var server;

// load middlewares
var wrapper = require('../middlewares/wrapper');
var errorHanding = require('../middlewares/error_handing');

// load routes
var webRouter = require('../routes/web');
var ioRouter = require('../routes/io');

// basic settings
app.keys = [pkg.name, pkg.description];
app.proxy = true;

// template engine settings
ejs(app, {
    root: path.join(__dirname, '../view/'),
    cache: isDev ? false : true,
    debug: isDev ? true : false,
    layout: false,
    locals: {
        isDev: isDev
    }
});

// global events listen
app.on('error', function(err, ctx) {
    err.url = err.url || ctx.request.url;
    logger.error(err.stack, ctx);
});

// use common middlewares
app.use(wrapper(app));
if(isDev) app.use(koaLogger());
app.use(errorHanding.error404(app));
app.use(errorHanding.error5xx(app));
app.use(serve(path.resolve(__dirname, '../public'), {
    maxage: isDev ? 0 : 30 * 24 * 60 * 60 * 1000
}));
app.use(router(app));

server = http.createServer(app.callback());
io = io(server);

// use routes
webRouter.route(app);
// app.use(terminal.middleware());
ioRouter.route(io);

exports.start = function() {
    server.listen(webConf.port, webConf.host, function() {
        rpcServer.start();
        logger.info('Server running at %s:%s', webConf.host, webConf.port);
    });
};
