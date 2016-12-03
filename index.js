#!/usr/bin/env node
/**
 *
 */
var debug = require('debug')('main');
var yargs = require('yargs');

yargs
  .usage('passcrak <command> [options]')
  .command('search [password]', 'Search for a password', {
    password: {
      type: 'string'
    }
  }, search)
  .command('verify [password]', 'Verify a password', {
    password: {
      type: 'string'
    }
  }, verify)
  .help()
  .argv;

function search (argv) {
  var rawsearch = require('./lib/rawsearch');
  var password = argv.password;

  if (password) {
    exec(password);
  }
  else if (!process.stdin.isTTY) {
    process.stdin.on('readable', function () {
      var chunk = process.stdin.read();
      if (!chunk) {
        return;
      }

      var password = chunk.toString('utf8').trim();

      exec(password);
    });
  }
  else {
    process.exit(1);
  }

  function exec (password) {
    debug('Executing search "' + password + '"');

    rawsearch.search(password.toString(), null).then(function (result) {
      process.stdout.write(password + (result?' FOUND\n':'NOT FOUND\n'));
    });
  }
}

function verify (argv) {
  var password = argv.password;
  console.log('Executing verification "' + password + '"');
}
