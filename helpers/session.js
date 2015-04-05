/*
* @Author: dm.yang
* @Date:   2015-04-05 21:32:30
* @Last Modified by:   dm.yang
* @Last Modified time: 2015-04-05 21:34:00
*/

'use strict';

var __sections = {};

exports.add = function(key, value) {
    return __sections[key] = value;
};

exports.get = function(key) {
    return __sections[key];
};

exports.remove = function(key) {
    return delete __sections[key];
};
