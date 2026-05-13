
// B"H

/**
 * @file test/run_all.js
 * @chapter The Lightning Court
 * @description
 * Strict suite runner.
 * Runs tests in-process for massive speedup.
 * Cleans DB artifacts before and after every test.
 */

const tests = require('./lightning/tests.js');
const runOne = require('./lightning/runOne.js');
const print = require('./lightning/printer.js');
const cleanDbFiles = require('./lightning/cleanDbFiles.js');

/**
 * @function main
 * @description
 * Runs the full test suite.
 *
 * @returns {void}
 */
function main() {
  print.start();

  cleanDbFiles();

  const suiteStart = Date.now();

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
