// B"H
const crypto = require('crypto');
function token(lock = {}, next = {}) {
  const safeLock = lock || {}, safeNext = next || {};
  const seed = JSON.stringify({ missionId:safeLock.missionId || safeNext.missionId || '', action:safeNext.action || '', at:Date.now(), nonce:crypto.randomBytes(8).toString('hex') });
  return Buffer.from(seed).toString('base64url');
}
/** B"H — Even stale locks receive a safe continuation token, not a crash. */
module.exports = { token };
