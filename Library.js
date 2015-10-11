/*
  Library
  Loads in all of the songs and does the behind the scenes logic
*/

var fs        = require('fs');
var path      = require('path');
var spawn     = require('child_process').spawn;
var _         = require('lodash');
var convert   = require('convert-seconds');
var probe     = require('node-ffprobe');
var recursive = require('recursive-readdir');
var sha1      = require('sha1');
var async     = require('async');
var numeral   = require('numeral');
var charm     = require('charm')();

var utils     = require('./utils');
var pack      = require('./package.json');

var Library = function(path) {
  charm.pipe(process.stdout);
  charm.reset();
  charm.cursor(false);
  this.songs = [];
  this.init();
};

Library.prototype.init = function() {
  var self = this;
  async.series([
    function(cb) {
      console.log("Loading CLItunes version " + pack.version + "\n")
      self.loadConfig();
      self.loadLibrary();
      cb();
    },
    function(cb) {
      console.log("Loading song paths")
      self.loadSongs(function() {
        console.log(format(self.songs.length) + " total songs detected");
        setTimeout(function() {
          cb();
        }, 250);
      });
    },
    function(cb) {
      if (self.scanCheckSum !== self.config.checkSum) {
        console.log("\nCalculating checksums to detect new songs");
        self.performChecksum(function() {
          cb();
        });
      }
    },
    function(cb) {
      console.log("\n");
      self.scan(function() {
        if (Object.keys(self.uniq)) {
          // Scan lib will contain the temporary library item that'll be merged
          // with the original CLItunesLibrary.json item
          self.scanLib = {};

          console.log("\nImporting " + format(Object.keys(self.uniq).length) + " new songs");
          self.extractMetaData(cb);
        }
      });
    },
    function(cb) {
      console.log("\nDone!");
    },
    function() {
      charm.cursor(true);
    }
  ]);
};

// Load the config file or create it if it doesn't exist
// Default paths for iTunes Library Folder
Library.prototype.loadConfig = function() {
  try {
    this.config = JSON.parse(fs.readFileSync(process.env.HOME + "/.CLItunes.json"));
  } catch (e) {
    this.config = defaultConfig = {
      extensions: ["mp3", "m4a"],  // Extensions to search for to play with afplay
      paths: [
        process.env.HOME + "/Music/iTunes/iTunes Media/Music" // Add iTunes path by default
      ],
      checkSum: null,  // Checksum of the last library scan - used to determine if new songs have been added
      index: 0  // uniq idfor each song
    };
    fs.writeFileSync(process.env.HOME + "/.CLItunes.json", JSON.stringify(this.config, null, 2));
  }
};

// Library contains the DB of all the song data
// loaded in from the provided paths
Library.prototype.loadLibrary = function() {
  try {
    this.library = JSON.parse(fs.readFileSync(process.env.HOME + "/.CLItunesLibrary.json"));
  } catch (e) {
    this.library = {}
    fs.writeFileSync(process.env.HOME + "/.CLItunesLibrary.json", JSON.stringify({}));
  }
};

// Checksum the filepath to see if there are new files
Library.prototype.performChecksum = function(cb) {
  var complete = 0;
  var self = this;

  this.sums = {};
  _.each(self.songs, function(path) {
      self.sums[sha1(path)] = path;
      //checksum.file(path, function (err, sum) {
      //  self.sums[path] = sum;
      //  console.log(++complete + "/" + self.songs.length);
      //});
      console.log(format(++complete) + "/" + format(self.songs.length));
      console.log(utils.progress(complete, self.songs.length));
      charm.up(1);
  });
  cb();
};

Library.prototype.scan = function(cb) {
  this.uniq = {};
  var self = this;

  _.each(self.sums, function(sum, key) {
    // If sum was not found in library

    if (!(sum in self.library)) {
      self.uniq[key] = sum;
    }
  });
  cb();
};

Library.prototype.extractMetaData = function(cb) {
  var songsProcessed = 0;
  var totalSongs = Object.keys(this.uniq).length;
  var self = this;

  async.forEachOfLimit(this.uniq, 25, function(song, key, callback) {
    probe(song, function(err, probeData) {
      var data;
      if (err) {
        data = { error: err };
      } else {
        data = {
          id: ++self.config.index,
          filename: probeData.filename,
          file: probeData.file,
          filexext: probeData.fileext,
          duration: probeData.streams[0].duration,
          title: probeData.metadata.title,
          artist: probeData.metadata.artist,
          album: probeData.metadata.album,
          genre: probeData.metadata.genre,
          track: probeData.metadata.track,
          date: probeData.metadata.date
        };
      }
      //console.log(song);
      self.scanLib[key] = data;

      console.log(format(++songsProcessed) + "/" + format(totalSongs));
      console.log(utils.progress(songsProcessed, totalSongs));
      charm.up(1);
      callback();
    });
  }, function(err) {
    if (songsProcessed === totalSongs) {
      cb();
    };
  });
}

// Load in all of the song locations that match extensions
Library.prototype.loadSongs = function(cb) {
  var locs = this.getPaths();
  var self = this;
  var ext  = this.getExtensions();
  this.songs = [];
  this.library = {};

  var totalPaths     = locs.length;
  var pathsFetched   = 0;
  var totalSongs     = 0;

  // Go through each loc and scan for songs
  _.each(locs, function(loc) {

    // Recursively scan loc
    recursive(loc, function (err, songs) {

      // For each file, check if it is an extension we are looking for
      _.each(songs, function(song) {

        // Valid song with extension from extensions list found
        if (ext.indexOf(path.extname(song).slice(1)) !== -1) {
          self.songs.push(song);
        }
      });
      if (++pathsFetched === totalPaths) {
        self.songs.sort();
        self.scanCheckSum = sha1(JSON.stringify(self.songs));
        cb();
      }
    });
  });
};

// Returns all of the paths of the songs in the config file
Library.prototype.getPaths = function() {
  return this.config.paths;
};

Library.prototype.getExtensions = function() {
  return this.config.extensions;
};

Library.prototype.saveLibrary = function() {
  fs.writeFileSync(process.env.HOME + "/.CLItunesLibrary.json", JSON.stringify(this.library));
};

function format(num) {
  return numeral(num).format('0,0');
}

module.exports = Library;
