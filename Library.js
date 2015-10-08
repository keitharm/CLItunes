/*
  Library
  Loads in all of the songs and does the behind the scenes logic
*/

var fs        = require('fs');
var path      = require('path');
var spawn     = require('child_process').spawn;
var _         = require('lodash');
var convert   = require('convert-seconds');
var mm        = require('musicmetadata');
var recursive = require('recursive-readdir');

var Library = function(path) {
  this.songs = [];
  this.init();
};

Library.prototype.init = function() {
  this.loadConfig();
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

// Load in all of the song data and parse with mm for song info
Library.prototype.loadSongs = function(cb) {
  var locs = this.getPaths();
  var self = this;
  var ext  = this.getExtensions();
  this.songs = [];

  var pathsFetched = 0;
  var totalPaths   = locs.length;
  // Go through each loc and scan for songs
  _.each(locs, function(loc) {

    // Recursively scan loc
    recursive(loc, function (err, songs) {

      // For each file, check if it is an extension we are looking for
      _.each(songs, function(song) {
        if (ext.indexOf(path.extname(song).slice(1)) !== -1) {
          self.songs.push(song);
        }
      });

      // Only execute callback once all paths have been traversed
      if (++pathsFetched === totalPaths) {
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

module.exports = Library;
