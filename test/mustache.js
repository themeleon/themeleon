'use strict';

function test(dest, expected, theme) {
  require('./test')(__filename, {
    init: function (h, themeleon) {
      themeleon.use(require('../mixins/mustache'));
      return theme;
    },

    ctx: {
      title: 'Hello world!',
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

(function () {
  var src = 'views/test-single.mustache';
  var dest = 'test-single.html';
  var expected = 'test-single.expected.html';

  return test(dest, expected, function (t) {
    t.mustache(src, dest);
  });
}());

(function () {
  var src = 'views/test-partials.mustache';
  var dest = 'test-partials-object.html';
  var expected = 'test-partials.expected.html';

  return test(dest, expected, function (t) {
    t.mustache(src, dest, {
      'foo': 'views/foo.mustache',
      'foo/bar': 'views/foo/bar.mustache',
    });
  });
}());

(function () {
  var src = 'views/test-partials.mustache';
  var dest = 'test-partials-directory.html';
  var expected = 'test-partials.expected.html';

  return test(dest, expected, function (t) {
    t.mustache(src, dest, 'views');
  });
}());
