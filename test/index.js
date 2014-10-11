'use strict';

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var test = require('tape');

var j = path.join;

var THEME = path.resolve(__dirname, 'theme');
var DEST = path.resolve(__dirname, 'dest');

test('render', function (t) {
  t.plan(5);

  rimraf(DEST, function () {
    var themeleon = require('..')();

    themeleon.use(j(THEME, 'mixin'), 'test');
    themeleon.use({object: 'object'});

    var theme = themeleon(THEME, function (th) {
      t.equal(th.test, 'test', 'Node.js module mixin (function)');
      t.equal(th.object, 'object', 'Object mixin (literal)');

      th.base('foo/bar');
      t.equal(th.ctx.base, './..', 'Base directory');

      th.copy('assets');
      th.copy('assets', 'public');
    });

    theme(DEST, {}).then(function () {
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
    });
  });
});

function compare(src, dest) {
  return cat(src) === cat(dest);
}

function cat(file) {
  return fs.readFileSync(file, 'utf8');
}
