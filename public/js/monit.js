/*
* @Author: chemdemo
* @Date:   2015-04-05 00:58:29
* @Last Modified by:   chemdemo
* @Last Modified time: 2015-04-06 02:43:33
*/

'use strict';

;(function(win) {

    // {clientId: [Window, Window]}
    var termWins = {};

    function init() {
        bindEvents();
    };

    function bindEvents() {
        $('#client-list').on('click', 'a[data-client]', function(e) {
            var $this = $(this);
            var evt = $this.data('client').split(':');
            var type = evt[0];
            var cid = evt[1];

            e.preventDefault();

            switch(type) {
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
        $.post('/client/destroy/' + cid).done(function(r) {
            if(r.code == 0) {
                // $target.parent().parent().remove();
                closeTerm(cid);
                location.reload();
            } else {
                alert('destroy client error');
            }
        });
    };

    $(init);

}(this));
