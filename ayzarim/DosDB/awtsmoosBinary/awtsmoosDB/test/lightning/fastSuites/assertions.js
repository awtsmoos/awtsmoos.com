
// B"H

/**
 * @file test/lightning/fastSuites/assertions.js
 * @chapter The Sharp Judge
 * @description
 * Tiny assertion vessel for lightning replacement suites.
 * It throws real errors, so failures remain strict.
 */

/**
 * @class LightningAssert
 * @description
 * Strict assertion helper.
 */
class LightningAssert {
  /**
   * @static
   * @method truth
   * @description Asserts truthiness.
   * @param {*} value - Value to check.
   * @param {string} message - Failure message.
   * @returns {void}
   */
  static truth(value, message) {
    if (!value) throw new Error(message);
  }

  /**
   * @static
   * @method equal
   * @description Asserts strict equality.
   * @param {*} actual - Actual value.
   * @param {*} expected - Expected value.
   * @param {string} message - Failure message.
   * @returns {void}
   */
  static equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}`);
    }
  }

  /**
   * @static
   * @method deepArray
   * @description Asserts array equality by JSON string.
   * @param {Array<*>} actual - Actual array.
   * @param {Array<*>} expected - Expected array.
   * @param {string} message - Failure message.
   * @returns {void}
   */
  static deepArray(actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) throw new Error(`${message}. Expected ${e}, got ${a}`);
  }
}

module.exports = LightningAssert;
