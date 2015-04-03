/*
* @Author: dm.yang
* @Date:   2015-04-03 16:17:50
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-03 19:08:54
*/

'use strict';

var path = require('path');
var http = require('http');
var koa = require('koa');
var io = require('socket.io');
var router = require('koa-router');
var serve = require('koa-static');
var koaLogger = require('koa-logger');

var pkg = require('../package.json');
var conf = require('../conf');

var webConf = conf.webServer;
var isDev = conf.isDev;
var app = koa();

// load middlewares
var wrapper = require('../middlewares/wrapper');
var errorHanding = require('../middlewares/error_handing');

// load routes
var webRouter = require('../routes/web');

// basic settings
app.keys = [pkg.name, pkg.description];
app.proxy = true;

// global events listen
app.on('error', function(err, ctx) {
    err.url = err.url || ctx.request.url;
    logger.error(err, ctx);
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

app = http.createServer(app.callback());
io = io(app);

// use routes
webRouter.route(app);
socketRouter.route(io);

exports.start = function() {
    app.listen(webConf.port, webConf.host, function() {
        rpc.start();
        logger.info('Server running at %s:%s', webConf.host, webConf.port);
    });
};
