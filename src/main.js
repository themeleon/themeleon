var fse = require('fs-extra');
var q = require('q');

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
exports.copy = function copy(src, dest) {
  if (typeof dest === 'undefined') {
    dest = src;
  }

  src = this.src + '/' + src;
  dest = this.dest + '/' + dest;

  this.tasks.push(copy(src, dest));
};
