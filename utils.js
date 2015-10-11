var repeat = require('repeat-string');

var pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

var progress = function(current, total) {
  var perc = Math.round((current/total)*100);
  var remain = 100-perc;
  return "[" + repeat("=", perc) + ">" + repeat("-", remain) + "] " + perc + "%";
};

module.exports.pad = pad;
module.exports.progress = progress;
