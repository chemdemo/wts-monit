/*
* @Author: chemdemo
* @Date:   2015-04-05 00:58:29
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-08 12:18:43
*/

'use strict';

;(function(win) {

    // {clientId: [Window, Window]}
    var termWins = {};
    var $listView;
    var socket;

    function init() {
        $listView = $('#client-list');
        createSock();
        bindEvents();
    };

    function createSock() {
        socket = io.connect(location.protocol + '//' + location.host + '/ws/monit');

        socket.on('connect', function() {
            socket.on('client:add', function(r) {
                fetchClients(r.group);
            });
            socket.on('client:destroy', function(r) {
                fetchClients(r.group);
                closeTerm(r.clientId);
            });
            socket.on('client:clean', function(r) {
                fetchClients(r.group);
                closeTerm();
            });

            socket.on('disconnect', function() {
                // alert('socket disconnect');
                console.warn('socket disconnect');
            });
        });

        socket.on('error', function(err) {
            // alert('socket error', err.message);
            console.error(err);
        });
    };

    function bindEvents() {
        $listView.on('click', 'a[data-action]', function(e) {
            var $this = $(this);
            var act = $this.data('action');
            var cid = $this.data('clientId');

            e.preventDefault();

            switch(act) {
                case 'open':
                    openTerm(cid);
                    break;

                case 'remove':
                    removeClient(cid, $this);
                    break;

                default: break;
            }
        });

        $(win).on('beforeunload', function() {
            for(var cid in termWins) closeTerm(cid);
        });
    };

    function openTerm(cid) {
        var termId = String(Math.random()).replace('\.', '');
        var features = 'directories=0,location=0,menubar=0,status=0,titlebar=0,toolbar=0,width=960,height=650';
        var termWin = window.open('/term/' + cid + '/' + termId, '', features);

        if(!(cid in termWins)) termWins[cid] = [];

        termWin.__clientId = cid;
        termWin.__termId = termId;
        termWins[cid].push(termWin);

        $(termWin).on('beforeunload', function() {
            termWins[cid] = $.grep(termWins[cid], function(win) {
                return win.__termId != termId;
            });
        });
    };

    function closeTerm(cid, tid) {
        if(!cid) {
            $.map(termWins, function(cid) {
                closeTerm(cid);
            });
            return;
        }

        var terms = termWins[cid] || [];

        $.each(terms, function(i, win) {
            if(!tid || win.__termId === tid) {
                win.opener = null;
                win.close();
            }
        });

        if(!tid) delete termWins.cid;
    };

    function removeClient(cid, $target) {
        socket.emit('client:destroy', cid);
    };

    function fetchClients(group) {
        $.get('/tmpl/list').done(function(tmpl) {
            var content = _.template(tmpl)({group: group});
            $listView.find('tbody').html(content);
        });
    };

    $(init);

}(this));
