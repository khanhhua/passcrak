#!/usr/bin/env node
/**
 *
 */
var yargs = require('yargs');

yargs
  .usage('passcrak <command> [options]')
  .command('search [password]', 'Search for a password', {
    // password: {
    //   default: ''
    // }
  }, search)
  .command('verify [password]', 'Verify a password', {
    // password: {
    //   default: ''
    // }
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
    console.log('Executing search "' + password + '"');

    rawsearch.search(password, null).then(function (result) {
      console.log('RESULT:', result);
    });
  }
}

function verify (argv) {
  var password = argv.password;
  console.log('Executing verification "' + password + '"');
}
