
// B"H

/**
 * @file test/lightning/runOne.js
 * @chapter One Gate Without Forking The Sky
 * @description
 * Runs one test in-process with captured output, trapped exit, and DB cleanup.
 */

const path = require('path');
const runModuleFile = require('./moduleRunner.js');
const OutputCapture = require('./outputCapture.js');
const cleanDbFiles = require('./cleanDbFiles.js');
const ExitTrap = require('./exitTrap.js');
const Env = require('./env.js');

/**
 * @function runOne
 * @description
 * Executes one test file with lightning isolation.
 *
 * @param {string} test - Test filename.
 * @returns {object} Result object.
 */
function runOne(test) {
  const started = Date.now();
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
  }

  capture.stop();
  restoreExit();
  restoreEnv();

  cleanDbFiles();

  const out = capture.text();
  const errText = error && error.stack ? error.stack : '';

  return {
    test,
    elapsed: Date.now() - started,
    status,
    res: {
      status
    },
    out,
    err: errText
  };
}

module.exports = runOne;
