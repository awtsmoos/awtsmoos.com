
// B"H

/**
 * @file BrowSpeechMapper.js
 * @description
 * ============================================================================
 * CHAPTER: THE BROWS THAT ROSE WITH THE WORD
 * ============================================================================
 *
 * Speech moves the mouth, but meaning moves the brows. Questions lift. Strong
 * words punch. Commas relax. Long explanations create asymmetric thought.
 *
 * @module BrowSpeechMapper
 */

/**
 * @class BrowSpeechMapper
 * @description
 * Converts text and time into brow emphasis.
 */
export class BrowSpeechMapper {
  /**
   * Samples speech-driven brow motion.
   *
   * @param {string} text - Dialogue text.
   * @param {number} time - Render time.
   * @returns {Object} Brow pose layer.
   */
  static sample(text = '', time = 0) {
    const clean = String(text || '');
    if (!clean.trim()) return {};

    const beat = Math.abs(Math.sin(time * 0.0065));
    const quick = Math.sin(time * 0.015);
    const question = clean.includes('?') ? 0.32 : 0;
    const exclaim = clean.includes('!') ? 0.26 : 0;
    const commaRelax = /[,;]/.test(clean) ? -0.05 : 0;
    const thought = clean.length > 60 ? Math.sin(time * 0.002) * 0.18 : 0;

    return {
      leftInnerLift: question + beat * 0.1 + thought,
      rightInnerLift: question + beat * 0.08 - thought,
      leftOuterLift: exclaim + quick * 0.04 + commaRelax,
      rightOuterLift: exclaim - quick * 0.04 + commaRelax,
      pinch: exclaim * 0.34 + beat * 0.06,
      compression: exclaim * 0.18,
      asymmetry: Math.abs(thought)
    };
  }
}
