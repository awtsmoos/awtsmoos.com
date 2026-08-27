
// B"H

/**
 * @file BlinkScheduler.js
 * @description
 * ============================================================================
 * CHAPTER: THE EYELID THAT CLOSED LIKE A TINY NIGHT
 * ============================================================================
 *
 * Blinks should not be a frantic metronome. They should arrive with character,
 * seed, mood, and rhythm. This scheduler returns eye openness from stable time
 * and id-based offset.
 *
 * @module BlinkScheduler
 */

/**
 * @class BlinkScheduler
 * @description
 * Computes blink openness.
 */
export class BlinkScheduler {
  /**
   * Samples eyelid openness.
   *
   * @param {number} time - Render time in milliseconds.
   * @param {string} seed - Stable character seed.
   * @param {number} rate - Blink rate multiplier.
   * @returns {number} Eye openness from 0 to 1.
   */
  static eyeOpen(time = 0, seed = 'human', rate = 1) {
    const salt = this.hash(seed) % 1700;
    const period = Math.max(1800, 4300 / Math.max(0.2, rate));
    const phase = ((time + salt) % period) / period;

    if (phase > 0.965) return 0.08;
    if (phase > 0.94) return 0.35;
    if (phase > 0.91) return 0.72;
    return 1;
  }

  /**
   * Hashes a short text seed.
   *
   * @param {string} seed - Seed text.
   * @returns {number} Positive hash.
   */
  static hash(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i += 1) {
      h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return h;
  }
}
