/*
  Player view
  The "GUI" of the terminal that shows current song information
*/

var readline = require('readline');
var repeat   = require('repeat-string');
var charm    = require('charm')();
var jp2a     = require('jp2a');
var blessed  = require('blessed');
var convert  = require('convert-seconds');
var _        = require('lodash');

var utils    = require('./utils');
var pack     = require('./package.json');

var Player = function(cb) {
  this.songList = [];
  this.songPath = [];

  var self = this;
  this.songList.push([ 'Song',  'Artist',  'Album', 'Duration', 'Play Count'  ])
  _.each(library.library, function(song) {
    var fmt = convert(Math.floor(song.duration));
    var record = {
      title: String(song.title),
      artist: String(song.artist),
      album: String(song.album),
      duration: fmt.minutes + ":" + utils.pad(fmt.seconds, 2),
      playCount: String(song.playCount)
    };

    record = _.values(record);
    var len = 35;
    record = record.map(function(item) {
      if (item.length >= len) {
        return item.slice(0, len-3) + "...";
      }
      return item;
    });

    self.songList.push(record);
    self.songPath.push(song.file);
  });
  this.init();
  this.screenSetup();
  this.browse();
  this.time = blessed.text({
    top: 25,
    content: this.timeBar(0),
    left: 'center',
    width: '60%',
    align: 'center'
  });

  this.screen.append(this.time);

  this.screen.render();
  cb()
};

Player.prototype.screenSetup = function() {
  this.screen = blessed.screen({
    title: 'CLItunes',
    resizeTimeout: 300,
    dockBorders: true,
    fullUnicode: true,
    cursor: {
      artificial: true,
      shape: 'line',
      blink: true,
      color: null
    },
    debug: true,
    warnings: true
  });
};

Player.prototype.init = function() {
  charm.pipe(process.stdout);
  charm.reset();
  charm.cursor(false);
};

Player.prototype.clearScreen = function() {
  charm.reset();
};

Player.prototype.browse = function() {

  this.screen.append(blessed.text({
    top: 0,
    left: 0,
    width: '100%',
    content: 'CLItunes Version 1.0.0',
    tags: true,
    align: 'center'
  }));

  this.screen.append(blessed.text({
    top: 0,
    left: 50,
    width: '100%',
    content: this.songList.length + ' total songs in Library',
    tags: true,
    align: 'center'
  }));

  this.screen.append(blessed.line({
    orientation: 'horizontal',
    top: 1,
    left: 0,
    right: 0
  }));

  var table = blessed.listtable({
    //parent: screen,
    top: 2,
    left: 'center',
    data: null,
    align: 'left',
    tags: true,
    keys: true,
    width: '100%',
    height: '50%',
    //width: 'shrink',
    vi: true,
    mouse: true,
    search: function(cb) {

    },
    style: {
      header: {
        fg: 'green',
        bold: true
      },
      cell: {
        fg: 'white',
        selected: {
          bg: 'cyan',
          fg: 'black'
        }
      }
    },
    scrollbar: {
      ch: ' ',
      style: {
        inverse: true
      }
    }
  });

  // var list = blessed.list({
  //   mouse: true,
  //   label: ' My list ',
  //   style: {
  //     bg: 'default',
  //     border: {
  //       fg: 'default',
  //       bg: 'default'
  //     },
  //     selected: {
  //       bg: 'green'
  //     }
  //   },
  //   width: '100%',

  //   top: 2,
  //   left: 'center',
  //   bottom: 0,
  //   tags: true,
  //   keys: true,
  //   vi:   true,
  //   invertSelected: false,
  //   items: this.songList,
  //   scrollbar: {
  //     ch: ' ',
  //     style: {
  //       inverse: true
  //     }
  //   }
  // });

  // this.screen.append(list);
  // list.select(0);

  table.items.forEach(function(item) {
    item.setHover(item.getText().trim());
  });

  // var item = list.items[1];
  // list.removeItem(list.items[1]);
  // list.insertItem(1, item.getContent());



  table.on('select', function(item, select) {
    library.play(self.songPath[select-1]);
    self.screen.debug(self.songList[select-1]);

    var over = blessed.box({
      top: Math.ceil(process.stdout.rows/2)+3,
      left: '38%',
      width: '50%',
      height: Math.ceil(process.stdout.rows/2)-3,
      content: ''
    });

    self.screen.append(over);

    self.screen.render();

    utils.albumArtWork(process.stdout.rows, self.songPath[select-1], function(data) {
      over.setContent(data);
    });
  });

  var self = this;
  this.screen.on('keypress', function(ch, key) {
    if (key.name === 'tab') {
      return key.shift
        ? self.screen.focusPrevious()
        : self.screen.focusNext();
    }
    if (key.name === 'escape' || key.name === 'q') {
      library.stop();
      return process.exit(0);
    }
  });


  var data1 = [
    [ 'Song',  'Artist',  'Album', 'duration', 'play count'  ],
    [ 'Elephant', 'Apple',  '1:00am' ],
    [ 'Bird',     'Orange', '2:15pm' ],
    [ 'T-Rex',    'Taco',   '8:45am' ],
    [ 'Mouse',    'Cheese', '9:05am' ]
  ];

  table.focus();
  //console.log(this.songList.slice(22, 25));
  table.setData(this.songList);

  this.screen.append(table);

  this.screen.render();
};

// Show or hide the cursor
Player.prototype.showCursor = function(show) {
  if (show || show === undefined) {
    charm.cursor(true);
  } else {
    charm.cursor(false);
  }
};

Player.prototype.timeBar = function(duration) {
  var dur = convert(Math.floor(duration));
  return "0:00 " + utils.progress(0, Math.floor(duration), false) + " " + dur.minutes + ":" + utils.pad(dur.seconds, 2);
};

Player.prototype.startTimeBar = function(duration) {
  time = blessed.text({
    top: 25,
    content: this.timeBar(0),
    left: 'center',
    width: '60%',
    align: 'center'
  });

  this.screen.append(time);

  this.screen.render();
};

module.exports = Player;