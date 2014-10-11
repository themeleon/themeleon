'use strict';

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var tape = require('tape');
var themeleonFactory = require('..');

var destPath = path.resolve(__dirname, 'dest');

module.exports = function (file, test) {
  var themeName = path.basename(file).replace(/\.js$/, '');
  var themePath = path.join(path.dirname(file), themeName);

  var helper = {
    path: {
      theme: function () {
        return path.join.apply(path, [themePath].concat(Array.prototype.slice.call(arguments)));
      },

      dest: function () {
        return path.join.apply(path, [destPath].concat(Array.prototype.slice.call(arguments)));
      },
    },

    cat: function () {
      return fs.readFileSync(file, 'utf8');
    },
  };

  tape(themeName, function (t) {
    helper.test = t.test;

    rimraf(destPath, function () {
      fs.mkdir(destPath, function (e) {
        if (e) {
          throw e;
        }

        var themeleon = themeleonFactory();
        var theme = themeleon(themePath, test.init(helper, themeleon));

        theme(destPath, test.ctx || {}).then(function () {
          test.test(helper);
          t.end();
        }, function (e) {
          console.error(e.stack);
        });
      });
    });
  });
};
