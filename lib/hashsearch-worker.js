var debug = require('debug')('hashsearch-worker');

var crypto = require('crypto');

main(process.argv.slice(2));

function main (argv) {
  process.on('message', messageHandler);

  debug('Work initialized...');
}

function messageHandler (message) {
  if (!message.passwords) {
    return;
  }
  var passwords = message.passwords;
  debug('[messageHandler] Handling passwords from parent...', passwords.length);

  message.passwords.forEach(function (password) {
    var hashedPassword = md5Hash(password);

    process.send({ hashedPassword: {
      password: password,
      hashed: hashedPassword
    }});
  });
}

function md5Hash (string) {
  var md5 = crypto.createHash('md5');
  return md5.update(string).digest('hex');
}