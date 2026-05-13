
// B"H

/**
 * @file test/lightning/env.js
 * @chapter The Test Wind
 * @description
 * Builds child process environment for lightning tests.
 */

/**
 * @function makeEnv
 * @description
 * Adds fast-test flag without mutating parent process.env.
 *
 * @returns {object} Child environment.
 */
function makeEnv() {
  return {
    ...process.env,
    AWTSMOOSDB_FAST_TEST: '1'
  };
}

module.exports = makeEnv;
