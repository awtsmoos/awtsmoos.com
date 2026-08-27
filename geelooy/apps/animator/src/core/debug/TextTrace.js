
// B"H

/**
 * @file TextTrace.js
 * @description
 * CHAPTER: THE QUIET ORACLE OF STRINGS
 *
 * This logger speaks only in text.
 * No object-dumps. No collapsing browser trees.
 * No endless console sludge drowning the eye.
 *
 * The Awtsmoos creates every world through measured speech.
 * So too this logger: clean lines, clear signs, concise design.
 */
export class TextTrace {
  static counters = new Map();

  /**
   * Returns whether text tracing is enabled.
   *
   * @returns {boolean} True when trace output should print.
   */
  static enabled() {
    try {
      const query = typeof location !== 'undefined' ? location.search || '' : '';
      const stored = typeof localStorage !== 'undefined'
        ? localStorage.getItem('awtsmoos.textTrace')
        : null;

      return (
        query.includes('debugTrace=1') ||
        query.includes('debugVisual=1') ||
        stored === '1'
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Emits a single text line.
   *
   * @param {string} scope - Log scope.
   * @param {string} message - Human-readable message.
   * @returns {void}
   */
  static line(scope, message) {
    if (!this.enabled()) return;
    console.log(`B"H - [${scope}] ${message}`);
  }

  /**
   * Emits a line every N calls for a stable key.
   *
   * @param {string} scope - Log scope.
   * @param {string} key - Stable key.
   * @param {number} interval - Print every interval calls.
   * @param {string} message - Message text.
   * @returns {void}
   */
  static every(scope, key, interval, message) {
    if (!this.enabled()) return;

    const stable = `${scope}:${key}`;
    const count = (this.counters.get(stable) || 0) + 1;
    this.counters.set(stable, count);

    if (count === 1 || count % interval === 0) {
      console.log(`B"H - [${scope}] ${message}`);
    }
  }

  /**
   * Emits a warning line.
   *
   * @param {string} scope - Log scope.
   * @param {string} message - Warning text.
   * @returns {void}
   */
  static warn(scope, message) {
    if (!this.enabled()) return;
    console.warn(`B"H - [${scope}] ${message}`);
  }

  /**
   * Emits an error line.
   *
   * @param {string} scope - Log scope.
   * @param {string} message - Error text.
   * @param {Error} [error] - Optional error object.
   * @returns {void}
   */
  static error(scope, message, error) {
    const suffix = error && error.message ? ` :: ${error.message}` : '';
    console.error(`B"H - [${scope}] ${message}${suffix}`);
  }
}
