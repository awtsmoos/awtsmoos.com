
// B"H

/**
 * @file VisualDebugLog.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE LOGGER BECAME SMALL AND SHARP
 * ═══════════════════════════════════════════════════════════════
 *
 * The prior logger dumped objects over and over until the console became a
 * swamp. This logger is text-only by default. It prints short lines, not giant
 * object trees. It is test-based: disabled unless the URL contains
 * `?debugVisual=1`, `&debugVisual=1`, or localStorage.visualDebug is "1".
 *
 * The Awtsmoos creates all worlds from nothing every instant through Divine
 * speech. Speech is holy when measured. The log now speaks only when asked,
 * and when it speaks, it speaks cleanly.
 *
 * @class VisualDebugLog
 */
export class VisualDebugLog {
  static counts = new Map();

  /**
   * Returns whether visual debug logs are enabled.
   *
   * @returns {boolean} True when visual diagnostics should print.
   */
  static enabled() {
    const query = typeof location !== 'undefined' ? location.search : '';
    const stored = typeof localStorage !== 'undefined'
      ? localStorage.getItem('visualDebug')
      : null;

    return query.includes('debugVisual=1') || stored === '1';
  }

  /**
   * Prints one text line every interval.
   *
   * @param {string} key - Stable diagnostic key.
   * @param {number} interval - Frame interval.
   * @param {string} message - Text-only diagnostic message.
   * @returns {void}
   */
  static every(key, interval, message) {
    if (!this.enabled()) return;

    const count = (this.counts.get(key) || 0) + 1;
    this.counts.set(key, count);

    if (count === 1 || count % interval === 0) {
      console.log(`B"H | VISUAL | ${count} | ${message}`);
    }
  }

  /**
   * Prints one warning line.
   *
   * @param {string} key - Stable diagnostic key.
   * @param {string} message - Warning text.
   * @returns {void}
   */
  static warn(key, message) {
    if (!this.enabled()) return;
    if (this.counts.has(`warn:${key}`)) return;
    this.counts.set(`warn:${key}`, 1);
    console.warn(`B"H | VISUAL_WARN | ${message}`);
  }

  /**
   * Prints an always-on fatal issue.
   *
   * @param {string} message - Fatal text.
   * @returns {void}
   */
  static error(message) {
    console.error(`B"H | VISUAL_ERROR | ${message}`);
  }
}
