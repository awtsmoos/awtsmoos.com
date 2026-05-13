
// B"H

/**
 * @file test/lightning/env.js
 * @chapter The Test Wind
 * @description
 * Applies fast test environment flags inside the current process.
 */

/**
 * @function applyFastEnv
 * @description
 * Sets lightning flags for DB internals and tests.
 *
 * @returns {Function} Restore function.
 */
function applyFastEnv() {
  const previous = {
    AWTSMOOSDB_FAST_TEST: process.env.AWTSMOOSDB_FAST_TEST,
    AWTSMOOSDB_TEST_SCALE: process.env.AWTSMOOSDB_TEST_SCALE,
    NODE_ENV: process.env.NODE_ENV
  };

  process.env.AWTSMOOSDB_FAST_TEST = '1';
  process.env.AWTSMOOSDB_TEST_SCALE = '0.14';
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';

  return () => {
    for (const key of Object.keys(previous)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  };
}

module.exports = {
  applyFastEnv
};
