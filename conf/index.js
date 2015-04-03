/*
* @Author: dm.yang
* @Date:   2015-04-03 16:00:49
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-03 19:11:15
*/

'use strict';

var path = require('path');

var env = process.env.NODE_ENV || (process.env.NODE_ENV = 'development');
var pf = process.platform;
var isDev = !!(pf.match(/win/) || env !== 'production');

module.exports = {
    webServer: {
        host: '0.0.0.0',
        port: 3005
    },
    rpcServer: {
        host: '0.0.0.0',
        port: 29000
    },
    logger: {
        root: path.resolve(__dirname, '../logs/'),
        options: {
            appenders: [
                {
                    type: 'file',
                    filename: 'web.log',
                    category: 'web',
                    maxLogSize: 1024000, // 1GB
                    backups: 3
                },
                {
                    type: 'file',
                    filename: 'rpc.log',
                    category: 'rpc',
                    maxLogSize: 1024000, // 1GB
                    backups: 3
                },
                {
                    type: 'file',
                    filename: 'socket.log',
                    category: 'socket',
                    maxLogSize: 1024000, // 1GB
                    backups: 3
                }
            ],
            levels: {
                web: isDev ? 'DEBUG' : 'INFO',
                rpc: isDev ? 'DEBUG' : 'INFO',
                socket: isDev ? 'DEBUG' : 'INFO',
            },
            replaceConsole: isDev ? false : true
        }
    },
    isDev: isDev
};
