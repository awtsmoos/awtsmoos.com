
// B"H

/**
 * @file core/idle/fastGate.js
 * @chapter The Lightning Gate That Never Enters Production
 * @description
 * Fast-test mode skips repeated forced fsync. close() still flushes.
 */

/**
 * @function shouldSkipForcedFsync
 * @description Decides whether idle may skip forced fsync.
 * @param {object} [options={}] - Idle options.
 * @returns {boolean} True when fsync can be skipped.
 */
function shouldSkipForcedFsync(options = {}) {
  if (options.closing) return false;
  return process.env.AWTSMOOSDB_FAST_TEST === '1';
}

module.exports = shouldSkipForcedFsync;
