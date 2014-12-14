'use strict';

var a = require('assert');
var fs = require('fs');
var r = require('path').resolve;
var rm = require('rimraf').sync;
var tf = require('..');

process.chdir(__dirname);

describe('Core', function () {
  var th = tf(), d = dest();

  th.use(r(__dirname, 'core/mixin'), 'test');
  th.use({object: 'object'});

  var theme = th('core', function (t) {
    it('should merge mixins', function () {
      a.equal(t.test, 'test');
      a.equal(t.object, 'object');
    });

    it('should compute base directory', function () {
      t.base('foo/bar');
      a.equal(t.ctx.base, '..');
    });

    t.copy('assets');
    t.copy('assets', 'public');
    t.copy('README.md');
  });

  it('should copy files', function (done) {
    theme(d, {}).then(function () {
      a.equal(
        cat(d + '/assets/css/main.css'),
        cat('core/assets/css/main.css')
      );

      a.equal(
        cat(d + '/public/css/main.css'),
        cat('core/assets/css/main.css')
      );

      a.equal(
        cat(d + '/README.md'),
        cat('core/README.md')
      );

      rm(d);
    }).then(done, done);
  });
});

describe('Templating', function () {
  var th = tf(), d = dest();

  th.use(require('../mixins/consolidate'));

  var theme = th('templating', function (t) {
    t.swig('index.html.swig', 'index.html');
  });

  it('should render template', function (done) {
    theme(d, { pageTitle: 'Hello' }).then(function () {
      a.equal(
        cat(d + '/index.html'),
        cat('templating/index.html')
      );

      rm(d);
    }).then(done, done);
  });
});

describe('Path', function () {
  var th = tf(), d = dest();

  var theme = th(['extend/b', 'extend/a'], function (t) {
    t.copy('assets');
    t.copy('README.md');
  });

  it('should resolve files in path', function (done) {
    theme(d, {}).then(function () {
      a.equal(
        cat(d + '/assets/css/main.css'),
        cat('extend/b/assets/css/main.css')
      );

      a.equal(
        cat(d + '/assets/js/main.js'),
        cat('extend/a/assets/js/main.js')
      );

      a.equal(
        cat(d + '/README.md'),
        cat('extend/b/README.md')
      );

      rm(d);
    }).then(done, done);
  });
});

describe('Extend', function () {
  var th = tf(), d = dest();

  it('should extend path', function () {
    var theme = th('extend/a', function () {}).extend('extend/b');
    a.deepEqual(theme.path, ['extend/b', 'extend/a']);
  });

  it('should keep parent procedure', function (done) {
    var called;

    var theme = th('extend/a', function () {
      called = 'parent';
    }).extend('extend/b');

    theme(d, {}).then(function () {
      a.equal(called, 'parent');
    }).then(done, done);
  });


  it('should show procedure', function (done) {
    var called;

    var theme = th('extend/a', function () {
      called = 'parent';
    }).extend('extend/b', function () {
      called = 'child';
    });

    theme(d, {}).then(function () {
      a.equal(called, 'child');
    }).then(done, done);
  });
});

function cat(file) {
  return fs.readFileSync(file, 'utf8');
}

function dest() {
  if (!dest.current) {
    dest.current = 1;
  }

  return 'dest' + dest.current++;
}
