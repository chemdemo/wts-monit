/*
 * @Author: dm.yang
 * @Date:   2015-04-05 17:06:08
 * @Last Modified by:   chemdemo
 * @Last Modified time: 2015-04-06 02:49:49
 */

'use strict';

;(function(win) {
    // console.log(win.opener)

    function init() {
        var clientHost = document.documentElement.getAttribute('data-client-host');
        var clientPort = document.documentElement.getAttribute('data-client-port');
        var title = document.title;
        var clientId = title.split('-')[1];
        var termId = title.split('-')[2];
        var socket = io.connect();

        socket.on('connect', function() {
            var handler = function(thunk) {
                socket.emit('term:input', thunk);
            };
            var term = new Terminal({
                cols: 80,
                rows: 40,
                useStyle: true,
                screenKeys: true
            });

            term.on('data', handler);

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

            socket.emit('term:conf', clientId, termId);
            socket.emit('term:input', '\n');
        });
    };

    onload = init;
}(this));
