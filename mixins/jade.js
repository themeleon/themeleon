'use strict';

var ap = require('ap');
var d = require('../decorators');
var fs = require('fs');
var q = require('q');
var merge = require('merge');

module.exports = function (jade) {
  jade = jade || require('jade');

  var renderFile = q.denodeify(jade.renderFile);
  var writeFile = q.denodeify(fs.writeFile);

  return {
    jade: d.srcDest(function (src, dest, options) {
      var writeIndex = ap([dest], writeFile);
      options = merge(options, this.ctx);

      this.push(renderFile(src, options).then(writeIndex));
    })
  };
};
