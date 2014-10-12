'use strict';

var path = require('path');

exports.src = function (fn) {
  return function (src) {
    arguments[0] = path.resolve(this.src, src);

    if (arguments.length < 1) {
      arguments.length = 1;
    }

    return fn.apply(this, arguments);
  };
};

exports.srcDest = function (fn) {
  fn = exports.src(fn);

  return function (src, dest) {
    if (typeof dest === 'undefined') {
      dest = src;
    }

    arguments[1] = path.resolve(this.dest,  dest);

    if (arguments.length < 2) {
      arguments.length = 2;
    }

    return fn.apply(this, arguments);
  };
};

exports.push = function (fn) {
  return function () {
    var args = arguments;

    return this.push(function () {
      return fn.apply(this, args);
    }.bind(this));
  };
};
