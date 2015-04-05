/* 
* @Author: chemdemo
* @Date:   2015-04-05 00:58:29
* @Last Modified by:   chemdemo
* @Last Modified time: 2015-04-05 01:07:49
*/

'use strict';

var socket;
var data = '';

window.addEventListener('load', function() {
    socket = io.connect();

    socket.on('connect', function() {
        socket.on('data', function(data) {
            term.writeln(data);
        });

        socket.on('output', function(data) {
            data = data.trim();
            if (data) term.writeln('\n' + data);
        });

        socket.on('disconnect', function() {
            term.destroy();
        });
    });
}, false);
