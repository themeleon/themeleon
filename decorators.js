'use strict';

exports.src = function (fn) {
  return function (src) {
    arguments[0] = this.src + '/' + src;
    return fn.apply(this, arguments);
  };
};

exports.srcDest = function (fn) {
  fn = exports.src(fn);

  return function (src, dest) {
    if (typeof dest === 'undefined') {
      dest = src;
    }

    arguments[1] = this.dest + '/' + dest;
    return fn.apply(this, arguments);
  };
};
