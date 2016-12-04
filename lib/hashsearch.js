var debug = require('debug')('hashsearch');

var util = require('util');
var EventEmitter = require('events');
var fs = require('fs');
var readline = require('readline');
var path = require('path');

var childProcess = require('child_process');

var PWD = process.env.PWD;

exports.search = search;

function search (encodedPassword, options) {
  if (!encodedPassword) {
    return Promise.resolve(-1);
  }

  options = Object.assign({}, options);

  return new Promise(function (resolve, reject) {
    debug('Starting to verify...');

    var doneCount = 0;

    var workers = [];
    var hashes = [];

    // MAP - REDUCE across processes
    var ps = passwordStream('./data/10_million_password_list_top_100000.txt');

    ps.on('searchable', function (items) {
      var worker = createHashWorker({
        onHashedPassword: function (data) {
          hashes.push(data);

          // debug('[searchable] All hashed password', hashes.length);
          if (data.hashed === encodedPassword) {
            resolve(data);

            workers.forEach(function (worker) {
              debug('[onHashedPassword] Killing worker');
              worker.unref();
              worker.kill(0);
            })
          }
        },
        onClose: function () {
          worker.unref();

          var index = workers.indexOf(worker);
          if (index !== -1) {
            workers.splice(index, 1);
          }

          console.log('[worker] Exits normally');
        }
      });

      workers.push(worker);

      worker.send({
        passwords: items
      });
    });
  });
}

function createHashWorker (options) {
  var params = Array.prototype.slice.call(arguments);
  var workerModule = './lib/hashsearch-worker';
  var worker = childProcess.fork(workerModule, params);

  var onHashedPassword = options.onHashedPassword;
  var onClose = options.onClose;

  worker.on('close', onClose);

  worker.on('message', function (message) {
    if (!message.hashedPassword) {
      return;
    }

    // debug('[hashsearch] Message received', message.hashedPassword);

    onHashedPassword(message.hashedPassword);
  })

  return worker;
}

function passwordStream (filename) {
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
    // debug('DATA IS AVAILABLE', line);

    lines.push(line);
    if (lines.length === 10000) {
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