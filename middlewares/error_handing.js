/*
* @Author: dm.yang
* @Date:   2015-01-07 16:09:02
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-05 15:31:35
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

            var errMsg = isDev ? err.stack : 'Internal Server Error';

            this.type = 'text';
            this.body = errMsg;
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
        this.type = 'text';
        this.body = 'Not Found';
    };
};
