// B"H
const crypto = require('crypto');

const COMPILER_VERSION = 'awtai-js-lm-head-q6k-v1';

/**
 * A stale kernel is exile.  The key binds file size, tensor geometry, offset,
 * type, and compiler version so old sparks cannot masquerade as fresh fire.
 */
function cacheKey(parts) {
  return crypto.createHash('sha256')
    .update(JSON.stringify({ version: COMPILER_VERSION, ...parts }))
    .digest('hex')
    .slice(0, 24);
}

module.exports = { COMPILER_VERSION, cacheKey };
