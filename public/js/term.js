/*
 * @Author: dm.yang
 * @Date:   2015-04-05 17:06:08
 * @Last Modified by:   dm.yang
 * @Last Modified time: 2015-04-05 23:32:50
 */

'use strict';

;(function(win) {
    // console.log(win.opener)

    function init() {
        var clientHost = document.documentElement.getAttribute('data-client-host');
        var clientPort = document.documentElement.getAttribute('data-client-port');
        var termId = document.documentElement.getAttribute('data-term-id');
        var clientId = document.title.split('-')[1];
        var socket = io.connect();
        var data = '';

        socket.on('connect', function() {
            var handler = function(thunk) {
                term.write(thunk);
                data += thunk;
            };
            var term = new Terminal({
                cols: 80,
                rows: 40,
                useStyle: true,
                screenKeys: true
            });

            term.on('data', handler);

            term.on('title', function(title) {
                document.title = title;
            });

            term.on('key', function(key, e) {
                if ('\r' == key) {
                    if (data) {
                        data = data.replace(/\r\n/, '').trim();
                        console.info('cmd:', data);
                        socket.emit('term:input', data);
                        data = '';
                    } else {
                        // not work??
                        term.insertLines([1]);
                    }
                }
            });

            term.open(document.body);
            term.write('\x1b[31mconnect to ' + [clientHost, clientPort].join(':') + '\x1b[m\r\n');

            socket.on('client:output', function(output) {
                console.log('output:', output);
                term.writeln('\n' + (output.trim() || '\x1b[31mEMPTY\x1b[m'));
            });

            socket.on('client:destroy', function() {
                // win.opener.__closeTerm(clientId, termId);
                win.close();
            });

            socket.on('disconnect', function() {
                term.destroy();
            });

            socket.emit('term:conf', clientId, termId);
        });
    };

    onload = init;
}(this));
