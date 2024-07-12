const crypto = require('crypto');

function generateHash() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = generateHash;
