/*
  Player view
  The "GUI" of the terminal that shows current song information
*/

var readline = require('readline');
var repeat   = require('repeat-string');
var charm    = require('charm')();
var pack     = require('./package.json');

var Player = function(cb) {
  this.init();
  this.fetchSize();
  //this.homeScreen();
  cb()
};

Player.prototype.init = function() {
  charm.pipe(process.stdout);
  charm.reset();
  charm.cursor(false);

  process.on("SIGWINCH", this.fetchSize);
};

Player.prototype.clearScreen = function() {
  charm.reset();
};

// Show or hide the cursor
Player.prototype.showCursor = function(show) {
  if (show || show === undefined) {
    charm.cursor(true);
  } else {
    charm.cursor(false);
  }
};

Player.prototype.homeScreen = function() {
  this.header();
};

Player.prototype.header = function() {
  console.log("CLItunes version " + pack.version);
  console.log(repeat("-", this.width));
};

Player.prototype.fetchSize = function() {
  this.width  = process.stdout.columns;
  this.height = process.stdout.rows;
};



module.exports = Player;