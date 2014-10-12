'use strict';

var ap = require('ap');
var d = require('../decorators');
var fs = require('fs');
var path = require('path');
var q = require('q');

module.exports = function (nunjucks) {
  nunjucks = nunjucks || require('nunjucks');

  var renderFile = q.denodeify(nunjucks.render);
  var writeFile = q.denodeify(fs.writeFile);

  var nunjucksCompile = d.push(function (src, dest) {
    if (typeof dest === 'undefined') {
      dest = src;
    }

    dest = path.join(this.dest, dest);
    var writeIndex = ap([dest], writeFile);
    this.base(dest);
    return renderFile(src, this.ctx).then(writeIndex);
  });

  nunjucksCompile.configure = nunjucks.configure;

  return {
    nunjucks: nunjucksCompile,
  };
};
