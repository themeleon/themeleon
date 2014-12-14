'use strict';

var nodePath = require('path');
var q = require('q');

/**
 * Themeleon helper constructor.
 *
 * See the functions from `factory.js` for variables signification.
 *
 * This constructor has an empty prototype (except the `use` method) since
 * Themeleon works only with mixins. There's a main mixin in `main.js`
 * containing the base functions, and all the extensions are merged in the
 * same way on the object instance.
 *
 * The purpose of this constructor is only to create new instances with
 * conventional properties to be used by the mixins.
 *
 * @constructor
 * @param {String} path
 * @param {String} dest
 * @param {Object} ctx
 */
module.exports = function Themeleon(path, dest, ctx) {
  this.tasks = [];
  this.path = path.map(function (p) { return nodePath.resolve(p); });
  this.dest = nodePath.resolve(dest);
  this.ctx = ctx;
};

/**
 * Mix given object(s) with current instance.
 *
 * @param {...Object} obj
 */
module.exports.prototype.use = function (/* obj... */) {
  for (var i = 0; i < arguments.length; i++) {
    for (var j in arguments[i]) {
      this[j] = arguments[i][j];
    }
  }
};

/**
 * Push a task (a function returning a promise) in the `tasks` array and
 * return a promise for this task end.
 *
 * @param {Function} task
 * @return {Promise}
 */
module.exports.prototype.push = function (task) {
  var deferred = q.defer();

  this.tasks.push(function () {
    var promise = task();
    deferred.resolve(promise);
    return promise;
  });

  return deferred.promise;
};
