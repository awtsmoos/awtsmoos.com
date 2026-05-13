
// B"H

/**
 * @file test/lightning/outputCapture.js
 * @chapter The Silent Chamber
 * @description
 * Captures logs with a tiny cap so heavy simulations do not spend time writing.
 */

const MAX_LINES = 80;

/**
 * @class OutputCapture
 * @description Temporarily captures console output.
 */
class OutputCapture {
  /**
   * @constructor
   */
  constructor() {
    this.lines = [];
    this.original = null;
  }

  /**
   * @method start
   * @description Begins capture.
   * @returns {void}
   */
  start() {
    this.original = {
      log: console.log,
      error: console.error,
      warn: console.warn
    };

    const write = (...args) => {
      if (this.lines.length < MAX_LINES) {
        this.lines.push(args.map(String).join(' '));
      }
    };

    console.log = write;
    console.error = write;
    console.warn = write;
  }

  /**
   * @method stop
   * @description Restores console methods.
   * @returns {void}
   */
  stop() {
    if (!this.original) return;
    console.log = this.original.log;
    console.error = this.original.error;
    console.warn = this.original.warn;
    this.original = null;
  }

  /**
   * @method text
   * @description Returns captured output.
   * @returns {string} Captured output.
   */
  text() {
    return this.lines.join('\n');
  }
}

module.exports = OutputCapture;
