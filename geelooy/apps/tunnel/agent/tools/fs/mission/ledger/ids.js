// B"H
const crypto = require('crypto');

/** B"H: every mission vessel receives a name before it enters time. */
function id(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(5).toString('hex')}`;
}

function at() { return new Date().toISOString(); }
module.exports = { id, at };
