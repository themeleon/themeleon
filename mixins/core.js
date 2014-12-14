'use strict';

var nodePath = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var merge = require('merge-dirs');
var q = require('q');
var d = require('../decorators');

var lstat = q.denodeify(fs.lstat);
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
exports.copy = d.push(d.dest(function (src, dest) {
  // Resolve the source file
  return d.src(function (resolvedSrc, dest) {
    return lstat(resolvedSrc).then(function (stat) {
      // If it's not a directory, raw copy
      if (!stat.isDirectory()) {
        return copy(resolvedSrc, dest);
      }

      // If it's a directory, merge all paths
      return this.path.reduce(function (promise, path) {
        return merge(nodePath.resolve(path, src), dest);
      }, q());
    }.bind(this));
  }).call(this, src, dest);
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
  dest = nodePath.dirname(nodePath.resolve(this.dest,  dest));

  if (dest.indexOf(this.dest) !== 0) {
    // Not contained in HTML root
    return '';
  }

  this.ctx.base = nodePath.relative(dest, this.dest);

  if (this.ctx.base === '') {
    this.ctx.base = '.';
  }
};
