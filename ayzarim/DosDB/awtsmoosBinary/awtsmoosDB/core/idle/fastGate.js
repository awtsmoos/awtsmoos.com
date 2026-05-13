
// B"H

/**
 * @file core/idle/fastGate.js
 * @chapter The Lightning Gate
 * @description
 * Test speed belongs behind one tiny gate.
 * Production stays strict.
 * Children of test/run_all.js may skip repeated forced whole-file fsync calls.
 */

/**
 * @function shouldSkipForcedFsync
 * @description
 * Decides whether waitForIdle may skip pager.fsync(true).
 *
 * @param {object} [options={}] - Idle options.
 * @param {boolean} [options.closing=false] - True when DB is closing.
 * @returns {boolean} True if forced fsync can be skipped.
 */
function shouldSkipForcedFsync(options = {}) {
  return process.env.AWTSMOOSDB_FAST_TEST === '1' && !options.closing;
}

module.exports = shouldSkipForcedFsync;
