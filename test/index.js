'use strict';

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

var j = path.join;

var THEME = path.resolve(__dirname, 'theme');
var DEST = path.resolve(__dirname, 'dest');

process.on('uncaughtException', function (e) {
  console.error(e.stack);
});

exports.render = function (test) {
  test.expect(2);

  rimraf(DEST, function () {
    var themeleon = require('..')();

    themeleon.use(j(THEME, 'mixin'), 'test');
    themeleon.use({object: 'object'});

    var theme = themeleon(THEME, function (t) {
      test.ok(t.test === 'test', 'Node.js module mixin (function)');
      test.ok(t.object === 'object', 'Object mixin (literal)');

      t.copy('assets');
      t.copy('assets', 'public');
    });

    theme(DEST, {}).done(test.done);
  });
};

exports.copy = function (t) {
  t.ok(
    compare(
      j(THEME, 'assets/css/main.css'),
      j(DEST, 'assets/css/main.css')
    ),
    'Copy an asset (same name)'
  );

  t.ok(
    compare(
      j(THEME, 'assets/css/main.css'),
      j(DEST, 'public/css/main.css')
    ),
    'Copy an asset (rename)'
  );

  t.done();
};

function compare(src, dest) {
  return cat(src) === cat(dest);
}

function cat(file) {
  return fs.readFileSync(file, 'utf8');
}
