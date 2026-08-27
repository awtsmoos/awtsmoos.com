// B"H

/**
 * @file BlinkScheduler.js
 * @description
 * Deterministic blinks with no jitter.
 */
export class BlinkScheduler {
  /**
   * Samples blink.
   *
   * @param {number} time - Time.
   * @param {number} seed - Seed.
   * @returns {number} Blink amount.
   */
  static sample(time, seed = 0) {
    const period = 2700 + (seed % 5) * 420;
    const local = (time + seed * 313) % period;
    const center = period - 130;
    const distance = Math.abs(local - center);

    if (distance > 90) return 0;
    return 1 - distance / 90;
  }
}