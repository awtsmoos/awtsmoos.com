
// B"H

/**
 * @file BrowSpeechAnalyzer.js
 * @description Speech-to-brow signal analyzer.
 */

export class BrowSpeechAnalyzer {
  /**
   * Analyzes text and time.
   *
   * @param {string} text - Speech text.
   * @param {number} time - Time in ms.
   * @returns {Object} Speech brow signals.
   */
  static analyze(text = '', time = 0) {
    const clean = String(text || '');
    const active = clean.trim().length > 0;
    const beat = active ? Math.abs(Math.sin(time * 0.007)) : 0;
    return {
      active,
      beat,
      questionLift: clean.includes('?') ? (Math.sin(time * 0.004) + 1) * 0.28 : 0,
      exclamationPunch: clean.includes('!') ? Math.max(0, Math.sin(time * 0.018)) * 0.45 : 0,
      pauseRelax: /[,;:—-]/.test(clean) ? -0.08 : 0,
      thought: clean.length > 52 ? Math.sin(time * 0.0022) * 0.18 : 0
    };
  }
}
