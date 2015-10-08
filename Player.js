/*
  Player view
  The "GUI" of the terminal that shows current song information
*/

var readline = require('readline');
var charm    = require('charm')();

var Player = function() {
  this.init();
};

Player.prototype.init = function() {
  charm.pipe(process.stdout);
  //this.clearScreen();
  //this.showCursor(false);
};

Player.prototype.clearScreen = function() {
  charm.reset(); // Clears the screen; like /usr/bin/reset
};

// Show or hide the cursor
Player.prototype.showCursor = function(show) {
  if (show || show === undefined) {
    charm.cursor(true);
  } else {
    charm.cursor(false);
  }
};



module.exports = Player;