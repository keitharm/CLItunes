var charm  = require('charm')();
var repeat = require('repeat-string');
var exec   = require('child_process').exec;

var pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

var progress = function(current, total, useCharm) {
  useCharm = useCharm || false;
  var cols   = process.stdout.columns;
  var rows   = process.stdout.rows;
  var c_half = cols/2;
  var r_half = rows/2;

  var done = Math.round((current/total)*c_half);
  var perc = Math.round(((current/total)*100));
  var remain = c_half-done;
  if (String(remain) === "NaN") {
    remain = 100;
    perc = 0;
  }

  var text = "[" + repeat("=", done) + ">" + repeat("-", remain) + "] " + perc + "%";
  if (useCharm) {
    console.log(text);
    charm.up(1);
  } else {
    return text;
  }
};

var albumArtWork = function(rows, song, cb) {
  var command = exec("ffmpeg -i \"" + song + "\" -an -vcodec copy /tmp/CLItunes_cover.jpg -y -v 0&& jp2a /tmp/CLItunes_cover.jpg --height=" + rows/2 + "  --colors", function (error, stdout, stderr) {
    cb(stdout);
  });
};

module.exports.pad = pad;
module.exports.progress = progress;
module.exports.albumArtWork = albumArtWork;
