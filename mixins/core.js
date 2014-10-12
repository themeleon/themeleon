'use strict';

var path = require('path');
var fse = require('fs-extra');
var q = require('q');
var d = require('../decorators');

var copy = q.denodeify(fse.copy);

/**
 * Return a promise for all the helper tasks.
 *
 * All the tasks are executed sequentially.
 *
 * @return {Promise}
 */
exports.promise = function () {
  if (this.tasks.length === 0) {
    // Empty theme
    return q();
  }

  var first = this.tasks.shift();

  return this.tasks.reduce(function (a, b) {
    return a.then(function () {
      return b();
    });
  }, first());
};

/**
 * @param {String} src Path to copy, relative to theme's root.
 * @param {String} dest Optional destination path.
 */
exports.copy = d.push(d.srcDest(function (src, dest) {
  return copy(src, dest);
}));

/**
 * Computes `ctx.base` path to be a relative path to the root
 * destination folder.
 *
 * For example if you're rendering `foo/bar.html`, `ctx.base`
 * will be `./..`, while it will be `.` when rendering `baz.html`.
 *
 * You'll typically something like:
 *
 *     <link rel="stylesheet" href="{{base}}/assets/css/main.css">`
 *
 * And in a template engin mixin, it will be used like this:
 *
 *     this.base(dest);
 *
 * @param {String} dest Destination path (relative to `this.dest`).
 */
exports.base = function (dest) {
  dest = path.dirname(path.resolve(this.dest,  dest));

  if (dest.indexOf(this.dest) !== 0) {
    // Not contained in HTML root
    return '';
  }

  this.ctx.base = path.relative(dest, this.dest);

  if (this.ctx.base === '') {
    this.ctx.base = '.';
  }
};
