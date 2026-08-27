// B"H
const crypto = require('crypto');
function make(prefix = 'task') { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`; }
function now() { return new Date().toISOString(); }
module.exports = { make, now };
