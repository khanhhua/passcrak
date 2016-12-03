var util = require('util');
var EventEmitter = require('events');
var fs = require('fs');
var path = require('path');

var PWD = process.env.PWD;

exports.search = search;

function search (password, options) {
  if (!password) {
    return Promise.resolve(-1);
  }

  options = Object.assign({}, options);

  return new Promise(function (resolve, reject) {
    console.log('[search] NEW PROMISE...');
    var s = sortedStream(path.join(PWD, 'data', '10_million_password_list_top_100000.txt'));

    s.on('sorted', function (items) {
      console.log('ALL ITEMS ARE SORTED');
      var index = items.indexOf(password);

      if (index !== -1) {
        resolve(true);
        // TODO Check if all are found before invoke:
        s.stop();
      }
    });

    s.on('close', function () {
      resolve(false);
    });
  })
}

function sortedStream (filename) {
  console.log('[search] sortedStream...', filename);

  var self = new EventEmitter();
  self.items = [];
  self.stop = stop;

  var inputStream = fs.createReadStream(filename, { encoding:'utf8' });

  inputStream.on('data', function (data) {
    var str = data.toString('utf8');
    var lines = str.split('\n');

    sort(self.items, lines);
    self.emit('sorted', self.items);
  });

  inputStream.on('close', function () {
    self.emit('close');
  })

  function sort (arr, items) {
    var insertionIndex = arr.length;
    // search for the index with insertionIndex
    // assuming the arr is already sorted
    var item;
    while (item = items.pop()) {
      while (arr[insertionIndex] > item && insertionIndex > 0) {
        insertionIndex--;
      }

      arr.splice(insertionIndex, 0, item); // insert at the insertionIndex
    }
  }

  function stop () {
    inputStream.destroy();
  }

  return self;
}