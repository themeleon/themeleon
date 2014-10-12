'use strict';

require('./test')(__filename, {
  init: function (h, themeleon) {
    themeleon.use(h.path.theme('mixin'), 'test');
    themeleon.use({object: 'object'});

    return function (th) {
      h.test('mixins merge', function (t) {
        t.plan(2);
        t.equal(th.test, 'test', 'module mixin (function)');
        t.equal(th.object, 'object', 'object mixin (literal)');
        t.end();
      });

      h.test('base directory', function (t) {
        t.plan(1);
        th.base('foo/bar');
        t.equal(th.ctx.base, '..');
        t.end();
      });

      th.copy('assets');
      th.copy('assets', 'public');
      th.copy('README.md');
    };
  },

  test: function (h) {
    h.test('copy', function (t) {
      t.plan(3);

      t.equal(
        h.cat(h.path.theme('assets/css/main.css')),
        h.cat(h.path.dest('assets/css/main.css')),
        'directory (same name)'
      );

      t.equal(
        h.cat(h.path.theme('assets/css/main.css')),
        h.cat(h.path.dest('public/css/main.css')),
        'directory (rename)'
      );

      t.equal(
        h.cat(h.path.theme('README.md')),
        h.cat(h.path.dest('README.md')),
        'file'
      );

      t.end();
    });
  },
});
