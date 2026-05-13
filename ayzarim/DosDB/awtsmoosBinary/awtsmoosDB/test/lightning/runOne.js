
// B"H

/**
 * @file test/lightning/runOne.js
 * @chapter One Gate At A Time
 * @description
 * Runs a single test child.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const makeEnv = require('./env.js');

/**
 * @function runOne
 * @description
 * Executes one test file in its own Node process.
 *
 * @param {string} test - Test filename.
 * @returns {object} Result object.
 */
function runOne(test) {
  const scriptPath = path.join(__dirname, '..', test);
  const started = Date.now();

  const res = spawnSync(process.execPath, [scriptPath], {
    stdio: 'pipe',
    env: makeEnv()
  });

  return {
    test,
    res,
    elapsed: Date.now() - started,
    out: res.stdout.toString(),
    err: res.stderr.toString()
  };
}

module.exports = runOne;
