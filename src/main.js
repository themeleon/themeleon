'use strict';

var fse = require('fs-extra');
var q = require('q');
var d = require('./decorators');

var copy = q.denodeify(fse.copy);

/**
 * Return a promise for all the helper tasks.
 *
 * @return {promise}
 */
exports.promise = function promise() {
  return q.all(this.tasks);
};

/**
 * @param {string} src Path to copy, relative to theme's root.
 * @param {string} dest Optional destination path.
 */
exports.copy = d.srcDest(function copy(src, dest) {
  this.push(copy(src, dest));
});
