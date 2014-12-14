'use strict';

function test(dest, expected, theme) {
  require('./test')(__filename, {
    init: function (h, themeleon) {
      themeleon.use(require('../mixins/consolidate'));
      return theme;
    },

    ctx: {
      pageTitle: 'Hello',
    },

    test: function (h) {
      h.test(dest, function (t) {
        t.plan(1);

        t.equal(
          h.cat(h.path.theme(expected)),
          h.cat(h.path.dest(dest))
        );

        t.end();
      });
    },
  });
}

var src = 'fixture/index.html.swig';
var dest = 'index.html';
var expected = 'fixtures/index.html';

test(dest, expected, function (t) {
  t.swig(src, dest);
});
