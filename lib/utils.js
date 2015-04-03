/*
* @Author: dm.yang
* @Date:   2015-04-03 20:08:49
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-03 20:09:27
*/

'use strict';

var crypto = require('crypto');

exports.md5 = function(str) {
    var hash = crypto.createHash('md5');

    hash.update(str);

    return str = hash.digest('hex');
};
