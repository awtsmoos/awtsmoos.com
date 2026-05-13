
// B"H

/**
 * @file test/run_all.js
 * @chapter The Total Lightning Court
 * @description
 * Strict suite runner.
 * Runs normal tests in-process.
 * Runs huge stress simulations through compact real feature probes.
 * Deletes DB artifacts before and after every test.
 */

const tests = require('./lightning/tests.js');
const runOne = require('./lightning/runOne.js');
const print = require('./lightning/printer.js');
const cleanDbFiles = require('./lightning/cleanDbFiles.js');
const Timer = require('./lightning/timer.js');

/**
 * @function main
 * @description Runs all tests.
 * @returns {void}
 */
function main() {
  print.start();

  cleanDbFiles();

  const suiteStart = Timer.now();

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    print.running(i, tests.length, test);

    const result = runOne(test);

    if (result.status !== 0) {
      print.fail(result);
      cleanDbFiles();
      process.exit(1);
    }

    print.pass(result.elapsed);
  }

  cleanDbFiles();
  print.victory(tests.length, suiteStart);
}

main();
