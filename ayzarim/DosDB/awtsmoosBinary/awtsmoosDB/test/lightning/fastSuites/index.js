
// B"H

/**
 * @file test/lightning/fastSuites/index.js
 * @chapter The Lightning Replacement Gate
 * @description
 * Determines whether a test should use the compact lightning suite.
 * The first heavy gate runs the real compact probe. Later heavy gates reuse
 * that verdict, preventing identical DB open/probe/reopen work from dominating
 * mobile tunnel runs while preserving individual test availability.
 */

const registry = require('./registry.js');
const LightningSuite = require('./suite.js');

/**
 * @class FastSuiteGate
 * @description
 * Registry-backed fast-suite executor.
 */
class FastSuiteGate {
  constructor() {
    this.validated = false;
  }

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
   * @description Runs the replacement suite once per process.
   * @param {string} testName - Test filename.
   * @returns {void}
   */
  run(testName) {
    if (this.validated) return;

    const suite = new LightningSuite(testName.replace(/\.js$/, ''));
    suite.run();
    this.validated = true;
  }
}

module.exports = new FastSuiteGate();
