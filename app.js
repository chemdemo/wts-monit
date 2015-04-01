/*
* @Author: dm.yang
* @Date:   2015-04-01 18:58:59
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-01 21:05:28
*/

'use strict';

var exec = require('child_process').exec;
var http = require('http');
var express = require('express');
var fs = require('fs');
var terminal = require('term.js');
var io = require('socket.io');

var app = express();
var server = http.createServer(app);

app.use(terminal.middleware());

app.get('/', function(req, res, next) {
    fs.createReadStream('./term.html').pipe(res);
});

io = io(server);

io.on('connection', function(socket) {
    socket.on('input', function(data) {
        var cmd = data.replace(/\n$/, '');

        exec(cmd, function(err, stdout, stderr) {
            if(err) {
                console.error(err);
                socket.emit('output', stderr.toString('utf8'));
                return;
            }
            socket.emit('output', stdout.toString('utf8'));
        });
    });

    socket.on('disconnect', function() {
        socket = null;
    });
});

server.listen(8889);
