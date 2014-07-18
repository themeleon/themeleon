'use strict';

var Themeleon = require('./Themeleon');
var main = require('./main');

/**
 * Themeleon factory.
 *
 * @return {function}
 */
module.exports = function factory() {

  /**
   * Wraps a high-level `render` function for a theme localized in
   * `dirname` to implement the Themeleon interface.
   *
   * @param {string} src Theme package directory.
   * @param {function} proc The render procedure.
   * @return {function} Main theme function wrapping the render function.
   */
  function themeleon(src, proc) {

    /**
     * Actual Themeleon interface implementation using previous `render`
     * function.
     *
     * @param {string} dest Directory to render theme in.
     * @param {object} ctx Variables to pass to the theme.
     * @return {promise} A Promises/A+ implementation.
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
  themeleon.exts = [main];

  /**
   * Use a Themeleon extension.
   *
   * If the `ext` parameter is a string, a `themeleon-{{ ext }}` package
   * will be required. If it's an object, we assume it's directly the
   * extension mixin.
   *
   * @param {string|object} ext Extension to include.
   */
  themeleon.use = function (ext) {
    if (typeof ext === 'string') {
      ext = require('themeleon-' + ext);
    }

    themeleon.exts.push(ext);
  };

  return themeleon;
};
