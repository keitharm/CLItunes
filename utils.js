var charm  = require('charm')();
var repeat = require('repeat-string');


var pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

var progress = function(current, total) {
  var cols   = process.stdout.columns;
  var rows   = process.stdout.rows;
  var c_half = cols/2;
  var r_half = rows/2;

  var done = Math.round((current/total)*c_half);
  var perc = Math.round(((current/total)*100));
  var remain = c_half-done;
  console.log("[" + repeat("=", done) + ">" + repeat("-", remain) + "] " + perc + "%");
  charm.up(1);
};

module.exports.pad = pad;
module.exports.progress = progress;
