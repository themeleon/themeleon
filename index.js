'use strict';

var Themeleon = require('./Themeleon');
var core = require('./mixins/core');

/**
 * Themeleon factory.
 *
 * @return {Function}
 */
module.exports = function factory() {

  /**
   * Wraps a high-level `render` function for a theme localized in
   * `dirname` to implement the Themeleon interface.
   *
   * @param {String} src Theme package directory.
   * @param {Function} proc The render procedure.
   * @return {Function} Main theme function wrapping the render function.
   */
  function themeleon(src, proc) {

    /**
     * Actual Themeleon interface implementation using previous `render`
     * function.
     *
     * @param {String} dest Directory to render theme in.
     * @param {Object} ctx Variables to pass to the theme.
     * @return {Promise} A Promises/A+ implementation.
     */
    return function render(dest, ctx) {
      var t = new Themeleon(src, dest, ctx);
      t.use.apply(t, themeleon.exts);
      proc(t);
      return t.promise();
    };
  }

  /**
   * @var {array} Container for Themeleon extensions.
   */
  themeleon.exts = [core];

  /**
   * Use a Themeleon extension.
   *
   * If the `ext` parameter is a string, a `themeleon-{{ ext }}` package
   * will be required to get the mixin constructor.
   *
   * If it's a function, we assume it is already the mixin constructor,
   * and it's called with given arguments.
   *
   * If it's an object, we assume it's directly the extension mixin.
   *
   * @param {String|Function|Object} ext Extension to include.
   * @param {...*} arg Optional arguments for mixin constructor.
   */
  themeleon.use = function (ext/*, arg... */) {
    if (typeof ext === 'string') {
      if (ext.indexOf('/') === -1) {
        try {
          ext = require('themeleon-' + ext);
        } catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
          }

          ext = require('./mixins/' + ext);
        }
      } else {
        ext = require(ext);
      }
    }

    if (typeof ext === 'function') {
      var args = Array.prototype.slice.call(arguments, 1);
      ext = ext.apply(null, args);
    }

    themeleon.exts.push(ext);

    return themeleon;
  };

  return themeleon;
};
