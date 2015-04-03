/*
* @Author: dm.yang
* @Date:   2015-01-07 16:09:02
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-03 17:47:03
*/

'use strict';

var isDev = require('../conf').isDev;

exports.error5xx = function (app) {
    return function* (next) {
        try {
            yield next;
        } catch (err) {
            this.status = err.status || 500;
            this.app.emit('error', err, this);

            var errMsg = env.isDev ? err.stack : 'Internal Server Error';

            switch (this.accepts('html', 'json')) {
                case 'html':
                    yield this.render('error', { error: errMsg });
                    break;
                case 'json':
                    this.body = { message: errMsg };
                    break
                default:
                    this.type = 'text';
                    this.body = errMsg;
            }
        }
    };
};

exports.error404 = function (app) {
    return function* (next) {
        yield next;

        if (404 != this.status) return;

        // we need to explicitly set 404 here
        // so that koa doesn't assign 200 on body=
        this.status = 404;

        switch (this.accepts('html', 'json')) {
            case 'html':
                yield this.render('404');
                break;
            case 'json':
                this.body = {message: 'Not Found'};
                break;
            default:
                this.type = 'text';
                this.body = 'Not Found';
        }
    };
};
