'use strict';

var ap = require('ap');
var d = require('../decorators');
var fs = require('fs');
var q = require('q');

module.exports = function (swig) {
  swig = swig || require('swig');

  var renderFile = q.denodeify(swig.renderFile);
  var writeFile = q.denodeify(fs.writeFile);

  return {
    swig: d.push(d.srcDest(function (src, dest) {
      var writeIndex = ap([dest], writeFile);
      this.base(dest);
      return renderFile(src, this.ctx).then(writeIndex);
    })),
  };
};
