'use strict';

var ap = require('ap');
var d = require('../decorators');
var fs = require('fs');
var path = require('path');
var q = require('q');

var readFile = q.denodeify(fs.readFile);
var glob = q.denodeify(require('glob'));

/**
 * Given partials are in the following format:
 *
 *     {
 *       name: 'path/to/partial.mustache',
 *       ...
 *     }
 *
 * The promise will resolve to the following:
 *
 *     {
 *       name: 'template file content',
 *       ...
 *     }
 *
 * The template files are relative to `src` directory.
 *
 * @param {String} src
 * @param {Object} partials
 * @return {Promise}
 */
function readPartialsObject(src, partials) {
  var promises = [];

  for (var name in partials) {
    var file = path.resolve(src, partials[name]);
    var promise = q.all([q(name), readFile(file, 'utf8')]);
    promises.push(promise);
  }

  return q.all(promises)
    .then(function (list) {
      list.forEach(function (item) {
        var name = item[0];
        var content = item[1];

        partials[name] = content;
      });

      return partials;
    });
}

/**
 * Find all `.mustache` files from partials directory and build
 * an object, then pass it to `readPartialsObject`.
 */
function readPartialsDirectory(src, partials) {
  src = path.resolve(src);
  partials = path.resolve(src, partials);

  return glob(partials + '/**/*.mustache')
    .then(function (files) {
      var object = {};

      files.forEach(function (file) {
        // Strip partials directory
        var partial = file.substr(partials.length + 1);

        // Strip extension
        partial = partial.substr(0, partial.lastIndexOf('.'));

        object[partial] = file;
      });

      return object;
    })
    .then(function (partials) {
      return readPartialsObject(src, partials);
    });
}

/**
 * If partials is a string, it will be treated as a directory
 * with `readPartialsDirectory`, otherwise as an object with
 * `readPartialsObject`.
 *
 * @param {String} src
 * @param {String|Object} partials
 * @return {Promise}
 */
function readPartials(src, partials) {
  if (!partials) {
    return null;
  }

  if (typeof partials === 'string') {
    return readPartialsDirectory(src, partials);
  }

  return readPartialsObject(src, partials);
}

module.exports = function (mustache) {
  mustache = mustache || require('mustache');

  var writeFile = q.denodeify(fs.writeFile);

  return {
    mustache: d.srcDest(function (src, dest, partials) {
      var promise = q.all([
        readFile(src, 'utf8'),
        readPartials(this.src, partials)
      ])
        .spread(function (template, partials) {
          return mustache.render(template, this.ctx, partials);
        }.bind(this))
        .then(ap([dest], writeFile));

      this.push(promise);
    }),
  };
};
