
// B"H

/**
 * @file test/lightning/timer.js
 * @chapter The Tiny Clock
 * @description
 * Uses high resolution time for fast tests.
 */

/**
 * @function now
 * @description Gets current high-resolution milliseconds.
 * @returns {number} Milliseconds.
 */
function now() {
  return Number(process.hrtime.bigint() / 1000000n);
}

module.exports = {
  now
};
