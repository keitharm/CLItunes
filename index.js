var Library = require("./Library");
var Player  = require('./Player');
var charm   = require('charm')();
var blessed = require('blessed');
var _       = require('lodash');

charm.pipe(process.stdout);
var player  = new Player(function() {
  var library = new Library(function() {
    var songList = [];
    var songPath = [];
    _.each(library.library, function(song) {
      songList.push(song.artist + " / " + song.title);
      songPath.push(song.file);
    });
    blah();
    function blah() {
      var screen = blessed.screen({
        title: 'CLItunes',
        resizeTimeout: 300,
        dockBorders: true,
        cursor: {
          artificial: true,
          shape: 'line',
          blink: true,
          color: null
        },
        debug: true,
        warnings: true
      });

      screen.append(blessed.text({
        top: 0,
        left: 0,
        width: '100%',
        content: 'CLItunes Version 1.0.0',
        tags: true,
        align: 'center'
      }));

      screen.append(blessed.text({
        top: 0,
        left: 50,
        width: '100%',
        content: songList.length + ' total songs in Library',
        tags: true,
        align: 'center'
      }));

      screen.append(blessed.line({
        orientation: 'horizontal',
        top: 1,
        left: 0,
        right: 0
      }));

      var list = blessed.list({
        mouse: true,
        label: ' My list ',
        style: {
          bg: 'default',
          border: {
            fg: 'default',
            bg: 'default'
          },
          selected: {
            bg: 'green'
          }
        },
        width: '100%',

        top: 2,
        left: 'center',
        bottom: 0,
        tags: true,
        keys: true,
        vi:   false,
        invertSelected: false,
        items: songList,
        scrollbar: {
          ch: ' ',
          style: {
            inverse: true
          }
        }
      });

      screen.append(list);
      list.select(0);

      list.items.forEach(function(item) {
        item.setHover(item.getText().trim());
      });

      var item = list.items[1];
      list.removeItem(list.items[1]);
      list.insertItem(1, item.getContent());



      list.on('select', function(item, select) {
        library.play(songPath[select]);
      });

      screen.on('keypress', function(ch, key) {
        if (key.name === 'tab') {
          return key.shift
            ? screen.focusPrevious()
            : screen.focusNext();
        }
        if (key.name === 'escape' || key.name === 'q') {
          library.stop();
          return process.exit(0);
        }
      });

      list.focus();

      screen.render();
    }

  });
});