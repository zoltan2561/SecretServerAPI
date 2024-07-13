const crypto = require('crypto');
//random hash generator elsodleges kulcsnak
function generateHash() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = generateHash;
