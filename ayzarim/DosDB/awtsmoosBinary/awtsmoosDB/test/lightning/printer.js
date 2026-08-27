
// B"H

/**
 * @file test/lightning/printer.js
 * @chapter The Voice Of The Gates
 * @description
 * Compact output for in-process lightning execution.
 */

const WARN_MS = 80;

/**
 * @function start
 * @description Prints suite header.
 * @returns {void}
 */
function start() {
  console.log('\n\x1b[36m\x1b[1mB"H - Starting Full Synchronous Validation (Strict + Total Lightning)...\x1b[0m\n');
}

/**
 * @function running
 * @description Prints running status.
 * @param {number} i - Test index.
 * @param {number} total - Total tests.
 * @param {string} test - Test file.
 * @returns {void}
 */
function running(i, total, test) {
  const progress = `[${String(i + 1).padStart(2)}/${total}]`;
  process.stdout.write(`\x1b[33m${progress} RUNNING: ${test.padEnd(30)}\x1b[0m`);
}

/**
 * @function pass
 * @description Prints pass status.
 * @param {number} elapsed - Milliseconds.
 * @returns {void}
 */
function pass(elapsed) {
  const color = elapsed > WARN_MS ? '\x1b[31m' : '\x1b[32m';
  console.log(` ${color}? PASS (${elapsed}ms)\x1b[0m`);
}

/**
 * @function fail
 * @description Prints failure output.
 * @param {object} result - Result.
 * @returns {void}
 */
function fail(result) {
  console.log(` \x1b[31m!!! FAILED (${result.elapsed}ms) !!!\x1b[0m`);

  const body = [
    result.err,
    result.out
  ].filter(Boolean).join('\n');

  console.error(body.trim());
}

/**
 * @function victory
 * @description Prints final success.
 * @param {number} total - Total tests.
 * @param {number} started - Suite start time.
 * @returns {void}
 */
function victory(total, started) {
  const Timer = require('./timer.js');
  const duration = ((Timer.now() - started) / 1000).toFixed(3);
  console.log(`\n\x1b[42m\x1b[30m\x1b[1m B"H - TOTAL VICTORY: ALL ${total} TESTS PASSED IN ${duration}s. \x1b[0m`);
}

module.exports = {
  start,
  running,
  pass,
  fail,
  victory
};
