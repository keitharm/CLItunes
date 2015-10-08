var fs       = require('fs');
var path     = require('path');
var spawn    = require('child_process').spawn;
var _        = require('lodash');
var convert  = require('convert-seconds');
var mm       = require('musicmetadata');

var Library = function(path) {
  // Folder that the music files are contained in
  // Defaults to iTunes
  this.init();
};

Library.prototype.init = function() {
  this.loadConfig();
};

// Load the config file or create it if it doesn't exist
// Default paths for iTunes Library Folder
Library.prototype.loadConfig = function() {
  try {
    this.config = fs.readFileSync(process.env.HOME + "/.CLItunes.json");
  } catch (e) {
    this.config = defaultConfig = {
      paths: [
        process.env.HOME + "/Music/iTunes/iTunes Media/Music"
      ]
    };
    fs.writeFileSync(process.env.HOME + "/.CLItunes.json", JSON.stringify(this.config));
  }
};

module.exports = Library;
