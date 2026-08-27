
// B"H

/**
 * @file BrowSpeechAnalyzer.js
 * @description
 * ============================================================================
 * CHAPTER: THE WORD THAT LIFTED THE BROW BEFORE THE MOUTH FINISHED
 * ============================================================================
 *
 * Text alone can move brows. Questions rise near the end. Exclamations punch.
 * Commas relax. Long phrases generate thoughtful asymmetry.
 *
 * @module BrowSpeechAnalyzer
 */

/**
 * @class BrowSpeechAnalyzer
 * @description
 * Converts text and time into brow emphasis data.
 */
export class BrowSpeechAnalyzer {
  /**
   * Analyzes speech.
   *
   * @param {string} text - Dialogue text.
   * @param {number} time - Time.
   * @returns {Object} Brow speech signals.
   */
  static analyze(text = '', time = 0) {
    const clean = String(text || '');
    if (!clean.trim()) {
      return { active: false, questionLift: 0, exclamationPunch: 0, pauseRelax: 0, thought: 0, beat: 0 };
    }

    const beat = Math.abs(Math.sin(time * 0.007));
    const questionLift = clean.includes('?') ? this.endPulse(time, 0.004) * 0.55 : 0;
    const exclamationPunch = clean.includes('!') ? Math.max(0, Math.sin(time * 0.018)) * 0.45 : 0;
    const pauseRelax = /[,;:—-]/.test(clean) ? -0.08 : 0;
    const thought = clean.length > 52 ? Math.sin(time * 0.0022) * 0.18 : 0;

    return {
      active: true,
      questionLift,
      exclamationPunch,
      pauseRelax,
      thought,
      beat,
      emphasis: beat * 0.12 + exclamationPunch
    };
  }

  /**
   * Computes slow phrase pulse.
   *
   * @param {number} time - Time.
   * @param {number} speed - Speed.
   * @returns {number} Pulse.
   */
  static endPulse(time, speed) {
    return (Math.sin(time * speed) + 1) * 0.5;
  }
}
