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

var Library = function(path) {
  this.songs = [];
  this.init();
};

Library.prototype.init = function() {
  this.loadConfig();
  this.loadLibrary();
  this.loadSongs(function() {
    console.log(this.songs.length);
  }.bind(this));
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
      ]
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

// Load in all of the song data and parse with mm for song info
// Store in library file if it is unique/first time encounter
Library.prototype.loadSongs = function(cb) {
  var locs = this.getPaths();
  var self = this;
  var ext  = this.getExtensions();
  this.songs = [];
  this.library = {};

  var pathsFetched   = 0;
  var totalPaths     = locs.length;
  var totalSongs     = 0;
  var blah           = 0;
  var songsProcessed = 0;

  // Go through each loc and scan for songs
  _.each(locs, function(loc) {

    // Recursively scan loc
    recursive(loc, function (err, songs) {

      // For each file, check if it is an extension we are looking for
      _.each(songs, function(song) {

        // Valid song with extension from extensions list found
        if (ext.indexOf(path.extname(song).slice(1)) !== -1) {
          totalSongs++;

          probe(song, function(err, probeData) {
            songsProcessed++;
            if (err) probeData = { error: true };
            var data = {
              id: 0,
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
            console.log(data);
            //console.log(songsProcessed, totalSongs);
            if (songsProcessed === totalSongs && pathsFetched === totalPaths) {
              console.log("Done with node-ffprobe and pathsFetched");
              cb();
            };
          });
        }
      });
      ++pathsFetched;
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

module.exports = Library;
