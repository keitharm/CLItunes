var fs       = require('fs');
var path     = require('path');
var spawn    = require('child_process').spawn;
var _        = require('lodash');
var readline = require('readline');
var convert  = require('convert-seconds');
var charm    = require('charm')();
var mm       = require('musicmetadata');

var colors = [ 'red', 'cyan', 'yellow', 'green', 'blue' ];

charm.pipe(process.stdout);
charm.reset();
charm.cursor(false);
var current;

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

walk(process.env.HOME + "/Music/iTunes/iTunes Media/Music", function(err, results) {
  var songs = [];
  _.each(results, function(song) {
    if ([".m4a", ".mp3"].indexOf(path.extname(song)) !== -1) {
      songs.push(song);
    }
  });

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', function(line){
    child.kill();
  });


  function randomSong() {
    var index = Math.floor(Math.random() * songs.length);
    return songs[index];
  }

  function playRandomSong() {
    clearInterval(current);
    charm.erase("screen");
    charm.position(0, 0);
    var song = randomSong();
    var ext = path.extname(song);
    var time = 0;
    current = setInterval(function() {
      ++time;
      var fmt = convert(time);
      var dur = convert(Math.floor(metadata.duration));
      console.log(fmt.minutes + ":" + pad(fmt.seconds, 2) + " " + progress(time, Math.floor(metadata.duration)) + " " + dur.minutes + ":" + pad(dur.seconds, 2));
      charm.up(1);
      charm.left(10);
    }, 1000);

    var parser = mm(fs.createReadStream(song), { duration: true }, function (err, data) {
      metadata = data;
      console.log(metadata.artist + " - " + metadata.album + " | " + path.basename(song).slice(0, -ext.length));
      var dur = convert(Math.floor(metadata.duration));
      console.log("0:00 " + progress(time, Math.floor(metadata.duration)) + " " + dur.minutes + ":" + pad(dur.seconds, 2));

      charm.up(1);
      charm.left(10);

      child = spawn('afplay', [song]);

      child.on('close', function (code) {
        playRandomSong();
      });
    });
  }

  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  function progress(current, total) {
    var perc = Math.round((current/total)*100);
    var remain = 100-perc;
    return "=".repeat(perc) + ">" + "-".repeat(remain) ;
  }

  playRandomSong();
});

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (;;) {
      if ((count & 1) == 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count == 0) {
        break;
      }
      str += str;
    }
    return rpt;
  }
}