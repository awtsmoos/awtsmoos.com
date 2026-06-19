
// B"H

/**
 * @file PhonemeLiteSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE TEXT THAT MOVED THE MOUTH WITHOUT AUDIO
 * ============================================================================
 *
 * Even before real audio analysis, text can breathe. Commas pause. Questions
 * lift the face. Exclamation opens the jaw. Long words widen the mouth. This
 * solver creates speech rhythm from letters alone.
 *
 * @module PhonemeLiteSolver
 */

/**
 * @class PhonemeLiteSolver
 * @description
 * Generates lightweight speech-mouth values from text and time.
 */
export class PhonemeLiteSolver {
  /**
   * Samples speech mouth data.
   *
   * @param {string} text - Dialogue text.
   * @param {number} time - Render time.
   * @returns {Object} Speech channel values.
   */
  static sample(text = '', time = 0) {
    const clean = String(text || '');
    if (!clean.trim()) return { active: false, mouthOpen: 0.04, mouthWide: 0, browLift: 0 };

    const charIndex = Math.floor((time * 0.012) % Math.max(1, clean.length));
    const char = clean[charIndex] || ' ';
    const pause = this.isPause(char) ? 0.15 : 1;
    const vowel = /[aeiouAEIOU]/.test(char) ? 1 : 0.45;
    const wide = /[eEiI]/.test(char) ? 0.22 : /[oOuU]/.test(char) ? -0.08 : 0.04;
    const beat = Math.abs(Math.sin(time * 0.011 + charIndex * 0.7));
    const question = clean.includes('?') ? 0.18 : 0;
    const exclaim = clean.includes('!') ? 0.2 : 0;

    return {
      active: true,
      mouthOpen: (0.08 + beat * 0.62 * vowel + exclaim) * pause,
      mouthWide: wide + beat * 0.08,
      browLift: question + exclaim * 0.5,
      cheekLift: beat * 0.12
    };
  }

  /**
   * Detects punctuation pause.
   *
   * @param {string} char - Current character.
   * @returns {boolean} True when pause-like.
   */
  static isPause(char) {
    return char === ',' || char === '.' || char === '!' || char === '?' || char === ';' || char === ':';
  }
}
