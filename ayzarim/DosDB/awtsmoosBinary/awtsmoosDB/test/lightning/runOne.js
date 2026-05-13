
// B"H

/**
 * @file test/lightning/runOne.js
 * @chapter One Gate Without Forking The Sky
 * @description
 * Runs one test in-process with source scaling, output capture, exit trapping,
 * and DB cleanup before and after.
 */

const path = require('path');
const runModuleFile = require('./moduleRunner.js');
const OutputCapture = require('./outputCapture.js');
const cleanDbFiles = require('./cleanDbFiles.js');
const ExitTrap = require('./exitTrap.js');
const Env = require('./env.js');
const Timer = require('./timer.js');

/**
 * @function runOne
 * @description Executes one test with lightning isolation.
 * @param {string} test - Test filename.
 * @returns {object} Result.
 */
function runOne(test) {
  const started = Timer.now();
  const scriptPath = path.join(__dirname, '..', test);
  const capture = new OutputCapture();

  cleanDbFiles();

  const restoreEnv = Env.applyFastEnv();
  const restoreExit = ExitTrap.install();

  capture.start();

  let status = 0;
  let error = null;

  try {
    runModuleFile(scriptPath);
  } catch (err) {
    if (err && err.isExitSignal) {
      status = err.code;
    } else {
      status = 1;
      error = err;
    }
  } finally {
    capture.stop();
    restoreExit();
    restoreEnv();
    cleanDbFiles();
  }

  return {
    test,
    elapsed: Timer.now() - started,
    status,
    res: {
      status
    },
    out: capture.text(),
    err: error && error.stack ? error.stack : ''
  };
}

module.exports = runOne;
