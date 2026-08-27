// B"H

/**
 * @file SpeechModeSelector.js
 * @description
 * Chooses subtitle or bubble so dialogue stays readable and does not cover faces.
 */
export class SpeechModeSelector {
  /**
   * Chooses speech display mode.
   *
   * @param {Object} data - Character data.
   * @param {Object} camera - Camera state.
   * @returns {string} "subtitle" or "bubble".
   */
  static choose(data = {}, camera = {}) {
    if (data.dialogueMode === 'subtitle') return 'subtitle';
    if (data.dialogueMode === 'bubble') return 'bubble';
    if (camera.subtitle === true) return 'subtitle';
    if ((camera.zoom || 0.6) > 0.67) return 'subtitle';
    return 'bubble';
  }
}