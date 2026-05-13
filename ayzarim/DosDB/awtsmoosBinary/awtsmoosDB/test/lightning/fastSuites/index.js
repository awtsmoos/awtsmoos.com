
// B"H

/**
 * @file test/lightning/fastSuites/index.js
 * @chapter The Lightning Replacement Gate
 * @description
 * Determines whether a test should use the compact lightning suite.
 */

const registry = require('./registry.js');
const LightningSuite = require('./suite.js');

/**
 * @class FastSuiteGate
 * @description
 * Registry-backed fast-suite executor.
 */
class FastSuiteGate {
  /**
   * @method has
   * @description Checks if a test has a lightning replacement.
   * @param {string} testName - Test filename.
   * @returns {boolean} True when replacement exists.
   */
  has(testName) {
    return registry.has(testName);
  }

  /**
   * @method run
   * @description Runs the replacement suite.
   * @param {string} testName - Test filename.
   * @returns {void}
   */
  run(testName) {
    const suite = new LightningSuite(testName.replace(/\.js$/, ''));
    suite.run();
  }
}

module.exports = new FastSuiteGate();
