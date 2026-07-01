// B"H
const crypto = require('crypto');
function token(lock = {}, next = {}) {
  const seed = JSON.stringify({ missionId:lock.missionId || '', action:next.action || '', at:Date.now(), nonce:crypto.randomBytes(8).toString('hex') });
  return Buffer.from(seed).toString('base64url');
}
/** B"H — A continuation token makes unfinished mission state tangible. */
module.exports = { token };
