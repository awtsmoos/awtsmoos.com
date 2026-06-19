
// B"H

/**
 * @file BrowMicroTwitch.js
 * @description Tiny living brow asymmetry.
 */

export class BrowMicroTwitch {
  /**
   * Samples micro brow motion.
   *
   * @param {number} time - Time.
   * @param {number} seed - Seed.
   * @returns {Object} Brow micro layer.
   */
  static sample(time = 0, seed = 0) {
    const a = Math.sin(time * 0.002 + seed * 1.7) * 0.035;
    const b = Math.cos(time * 0.0016 + seed * 2.1) * 0.025;
    return {
      left: { outerLift: a, yOffset: -a * 2 },
      right: { outerLift: b, yOffset: -b },
      global: { tremble: Math.abs(a) + Math.abs(b) }
    };
  }
}
