'use strict';

var path = require('path');
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
  dest = path.resolve(this.dest,  dest);
  dest = dest.substr(this.dest.length + 1);

  var base = '.';

  // Add as much `/..` as there is nested directories
  (dest.match(/\//g) || []).forEach(function () {
    base += '/..';
  });

  // Set context
  this.ctx.base = base;
};
