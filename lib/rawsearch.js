var debug = require('debug')('rawsearch');

var util = require('util');
var EventEmitter = require('events');
var fs = require('fs');
var readline = require('readline');
var path = require('path');

var PWD = process.env.PWD;

exports.search = search;

function search (password, options) {
  if (!password) {
    return Promise.resolve(-1);
  }

  options = Object.assign({}, options);

  return new Promise(function (resolve, reject) {
    debug('Starting to search...');
    var s = sortedStream(path.join(PWD, 'data', '10_million_password_list_top_100000.txt'));

    s.on('searchable', function (items) {
      debug('Items searchable:', items.length);

      var index = items.indexOf(password);
      // console.log('INDEX IN NEW DATA:', items.indexOf('0995359291'));

      if (index !== -1) {
        // TODO Check if all are found before invoke:
        debug('\n\nPassword found. Stopping...\n\n');

        s.stop();
        resolve(true);
      }
    });
  })
}

function sortedStream (filename) {
  debug('Opening file', filename);

  var self = new EventEmitter();
  self.items = [];
  self.stop = stop;

  var inputStream = fs.createReadStream(filename, { encoding:'utf8' });
  var rl = readline.createInterface({
    input: inputStream
  });

  var lines = [];
  rl.on('line', function (line) {
    debug('DATA IS AVAILABLE', line);

    lines.push(line);
    if (lines.length === 1000) {
      debug('INDEX IN NEW DATA:', lines.indexOf('0995359291'));

      self.emit('searchable', Object.assign([], lines));

      lines = [];
    };
  });

  rl.on('close', function () {
    debug('READLINE IS CLOSED');

    if (!lines || !lines.length) {
      return;
    }

    debug('SORT ONE LAST TIME');
    self.emit('searchable', lines);

    lines = [];
  });

  inputStream.on('close', function () {
    debug('FILE IS CLOSED');
  });

  function stop () {
    rl.close();
  }

  return self;
}