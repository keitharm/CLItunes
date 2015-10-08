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
  this.init();
  this.songs = [];
};

Library.prototype.init = function() {
  this.loadConfig();
  this.loadSongs();
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
Library.prototype.loadSongs = function() {
  var paths = this.getPaths();

  // Go through each path and scan for songs
  _.each(paths, function(path) {
    recursive(path, function (err, files) {
      console.log(files.length);
    });
  });
};

// Returns all of the paths of the songs in the config file
Library.prototype.getPaths = function() {
  return this.config.paths;
};

module.exports = Library;
