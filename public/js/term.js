/*
 * @Author: dm.yang
 * @Date:   2015-04-05 17:06:08
 * @Last Modified by:   chemdemo
 * @Last Modified time: 2015-04-07 23:00:28
 */

'use strict';

;(function(win) {
    // console.log(win.opener)
    var clientHost;
    var clientPort;
    var clientId;
    var termId;

    function init() {
        var title = document.title;

        clientHost = document.documentElement.getAttribute('data-client-host');
        clientPort = document.documentElement.getAttribute('data-client-port');
        clientId = title.split('-')[1];
        termId = title.split('-')[2];

        createSock();
    };

    function createSock() {
        var socket = io.connect(location.protocol + '//' + location.host + '/ws/term');
        var data;

        socket.on('connect', function() {
            var term = new Terminal({
                cols: 120,
                rows: 40,
                useStyle: true,
                screenKeys: true
            });

            term.on('data', function(thunk) {
                socket.emit('term:input', thunk);
            });

            term.open(document.body);
            term.write('\x1b[31mconnect to ' + [clientHost, clientPort].join(':') + '\x1b[m\r\n');

            socket.on('client:output', function(output) {
                console.log('output:', output);
                term.write((output || '\x1b[31mEMPTY\x1b[m'));
            });

            socket.on('client:destroy', function() {
                win.close();
            });

            socket.on('disconnect', function() {
                term.destroy();
            });

            socket.emit('term:online', clientId, termId);
            socket.emit('term:input', '\n');
        });

        socket.on('error', function(err) {
            console.error(err);
        });
    };

    onload = init;
}(this));
