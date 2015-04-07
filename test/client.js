/*
* @Author: dm.yang
* @Date:   2015-04-05 15:55:27
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-07 20:13:28
*/

'use strict';

var net = require('net');
var fs = require('fs');
var pty = require('pty.js');

var monitHost = '0.0.0.0';
var monitPort = 3977;

var sock = new net.Socket();
var terms = {};

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
        console.warn('param `cmd` missing');
        return;
    }

    switch(msg.cmd) {
        case 'client:ready':
            if(msg.clientId) sock.clientId = msg.clientId;

            send2monit({cmd: 'client:online', group: 'foo'});

            break;

        case 'client:destroy':
            process.exit();
            // sock.isDestroy = true;
            // sock.destroy();
            // send2monit({cmd: 'client:destroy'});

            break;

        case 'term:input':
            var term = getTerm(msg.termId);

            if(term) term.write(msg.input, 'utf8');
            console.log('INPUT:', msg.input);
            break;

        case 'term:destroy':
            var term = getTerm(msg.termId);

            if(term) {
                delete terms[msg.termId];
                console.log('remove term:%s', msg.termId);
            }
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

    setImmediate(function() {
        sock.write(str, 'utf8');
        console.log('client write msg:%s', str);
    });
};

function getTerm(termId) {
    if(termId in terms) return terms[termId];

    var term = pty.fork(
        process.env.SHELL || 'sh', [], {
            name: fs.existsSync('/usr/share/terminfo/x/xterm-256color')
                ? 'xterm-256color'
                : 'xterm',
            cols: 80,
            rows: 40,
            cwd: process.env.HOME
        }
    );

    term.on('data', function(data) {
        console.log('OUTPUT:', data);
        send2monit({cmd: 'client:output', termId: termId, output: data});
    });

    terms[termId] = term;

    return term;
};
