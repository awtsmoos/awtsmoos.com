// B"H

/**
 * @file MouthPhrasePlanner.js
 * @description
 * Creates deterministic phrase mouth plans so the mouth changes every useful
 * beat, not every frame.
 */
export class MouthPhrasePlanner {
  /**
   * Gets mouth shape for text/time.
   *
   * @param {string} text - Speech text.
   * @param {number} time - Render time.
   * @param {number} seed - Character seed.
   * @returns {string} Shape key.
   */
  static shape(text = '', time = 0, seed = 0) {
    if (!text) return 'rest';

    const shapes = ['small', 'wide', 'flat', 'round', 'smile', 'small', 'teeth', 'closed'];
    const duration = 145 + (text.length % 5) * 18;
    const index = Math.floor((time + seed * 91) / duration) % shapes.length;
    return shapes[index];
  }
}