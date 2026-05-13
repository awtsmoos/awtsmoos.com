
// B"H

/**
 * @file test/lightning/outputCapture.js
 * @chapter The Silent Chamber
 * @description
 * Captures noisy test logs in memory.
 * Passing tests stay quiet.
 * Failing tests reveal their captured storm.
 */

const MAX_LINES = 240;

/**
 * @class OutputCapture
 * @description
 * Temporarily captures console output.
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
      if (this.lines.length >= MAX_LINES) return;
      this.lines.push(args.map(String).join(' '));
    };

    console.log = write;
    console.error = write;
    console.warn = write;
  }

  /**
   * @method stop
   * @description Restores console.
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
   * @description Returns captured text.
   * @returns {string} Captured output.
   */
  text() {
    return this.lines.join('\n');
  }
}

module.exports = OutputCapture;
