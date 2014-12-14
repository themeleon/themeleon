'use strict';

var ap = require('ap');
var d = require('../decorators');
var fs = require('fs');
var merge = require('merge');
var q = require('q');
var cons = require('consolidate');

var writeFile;

Object.keys(cons).forEach(function (engine) {
  var renderFile;

  exports[engine] = d.push(d.srcDest(function (src, dest, options) {
    // Lazy
    renderFile = renderFile || q.denodeify(cons[engine]);
    writeFile = writeFile || q.denodeify(fs.writeFile);

    // Ensure base path is set
    this.base(dest);

    // Merge options
    var ctx = merge({}, this.ctx, options);

    // Write destination callback
    var writeDest = ap([dest], writeFile);

    // Render, then write
    return renderFile(src, ctx).then(writeDest);
  }));
});
