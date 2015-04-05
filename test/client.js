/*
* @Author: dm.yang
* @Date:   2015-04-05 15:55:27
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-05 23:12:10
*/

'use strict';

var net = require('net');
var exec = require('child_process').exec;

var monitHost = '192.168.33.88';
var monitPort = 3977;

var sock = new net.Socket();

connect();

sock.on('connect', function() {
    console.log('monitor client connect to %s:%s success', monitHost, monitPort);
    sock.isConnect = true;
});

sock.on('timeout', function() {
    console.warn('monitor client timeout');
});

sock.on('error', function(err) {
    console.error('monitor client error', err);
});

sock.on('close', function() {
    sock.isConnect = false;
    sock.clientId = null;

    if(!sock.isDestroy) {
        console.warn('monitor client closed');
        setTimeout(function() {
            console.log('try to reconnect monitor');
            connect();
        }, 1000);
    }
});

sock.on('data', function(msg) {
    msg = msg.toString('utf8');

    console.info('reveived msg:%s', msg);

    msg = JSON.parse(msg);

    if(!msg.cmd) {
        console.warn('param `cmd` required');
        return;
    }

    switch(msg.cmd) {
        case 'client:ready':
            if(msg.clientId) sock.clientId = msg.clientId;

            send2monit({cmd: 'client:conf', group: 'foo'});

            break;

        case 'client:destroy':
            process.exit();
            // sock.isDestroy = true;
            // sock.destroy();
            // send2monit({cmd: 'client:destroy'});

            break;

        case 'term:input':
            console.log('CMD:', msg.input);
            exec(msg.input, function(err, stdout, stderr) {
                if(!err) {
                    console.log(stdout);
                    send2monit({cmd: 'client:output', termId: msg.termId, output: stdout});
                } else {
                    console.error(err);
                    send2monit({cmd: 'client:output', termId: msg.termId, output: stderr || err.message});
                }
            });
            break;

        default: break;
    }
});

function connect() {
    sock.connect(monitPort, monitHost);
};

function send2monit(msg) {
    if(!msg || !Object.keys(msg).length) return;

    if(!sock.isConnect) {
        console.warn('socket has not connected');
        return;
    }

    if(!sock.clientId) {
        console.error('client id has not assigned');
        return;
    }

    msg.clientId = sock.clientId;

    var str = JSON.stringify(msg);

    // use long connection
    sock.write(str, 'utf8');
    // sock.end(str, 'utf8');
    console.log('client write msg:%s', str);
};
