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
  .command('reverse [encrypted]', 'Reverse an encrypted password to its original', {
    encrypted: {
      type: 'string'
    }
  }, reverse)
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

function reverse (argv) {
  var hashsearch = require('./lib/hashsearch');
  var encrypted = argv.encrypted;

  if (encrypted) {
    exec(encrypted);
  }
  else if (!process.stdin.isTTY) {
    process.stdin.on('readable', function () {
      var chunk = process.stdin.read();
      if (!chunk) {
        return;
      }

      var encrypted = chunk.toString('utf8').trim();

      exec(encrypted);
    });
  }
  else {
    process.exit(1);
  }

  function exec (encrypted) {
    debug('Executing reverse "' + encrypted + '"');

    hashsearch.search(encrypted.toString(), null).then(function (result) {
      var decodedPassword = result.password;
      if (decodedPassword) {
        process.stdout.write(decodedPassword + ' FOUND\n');
      }
      else {
        process.stdout.write('NOT FOUND\n');
      }
    });
  }
}
