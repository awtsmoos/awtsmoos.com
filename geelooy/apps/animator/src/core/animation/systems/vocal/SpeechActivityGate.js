
// B"H

/**
 * @file SpeechActivityGate.js
 * @description
 * CHAPTER: THE GATE OF UTTERANCE.
 *
 * This module decides if speech animation should be active.
 * It also centralizes the speech text cleanup so the rest of the
 * pipeline remains clear and modular.
 */
export class SpeechActivityGate {
  /**
   * Returns normalized speech text.
   *
   * @param {Object} data - Character data.
   * @returns {string} Clean speech text.
   */
  static getSpeechText(data = {}) {
    return typeof data.speech === 'string' ? data.speech.trim() : '';
  }

  /**
   * Determines if the character is actively speaking.
   *
   * @param {Object} data - Character data.
   * @returns {boolean} True when speech should animate.
   */
  static isActive(data = {}) {
    const speech = this.getSpeechText(data);
    return Boolean(data.isTalking && speech.length);
  }
}
