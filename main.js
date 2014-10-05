'use strict';

var fse = require('fs-extra');
var q = require('q');
var d = require('./decorators');

var copy = q.denodeify(fse.copy);

/**
 * Return a promise for all the helper tasks.
 *
 * @return {Promise}
 */
exports.promise = function () {
  return q.all(this.tasks);
};

/**
 * @param {String} src Path to copy, relative to theme's root.
 * @param {String} dest Optional destination path.
 */
exports.copy = d.srcDest(function (src, dest) {
  var p = copy(src, dest);
  this.push(p);
  return p;
});
