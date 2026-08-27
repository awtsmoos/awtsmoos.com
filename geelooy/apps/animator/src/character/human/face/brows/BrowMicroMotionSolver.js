
// B"H

/**
 * @file BrowMicroMotionSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE TINY TWITCHES THAT MADE THE FACE STOP BEING A MASK
 * ============================================================================
 *
 * Living brows do not freeze. They drift, settle, react to gaze, and tremble
 * slightly during thought. These micro-motions are subtle but vital.
 *
 * @module BrowMicroMotionSolver
 */

/**
 * @class BrowMicroMotionSolver
 * @description
 * Generates subtle brow motion.
 */
export class BrowMicroMotionSolver {
  /**
   * Samples brow micro movement.
   *
   * @param {number} time - Render time.
   * @param {string} seed - Character seed.
   * @returns {Object} Brow micro pose.
   */
  static sample(time = 0, seed = 'human') {
    const salt = seed.length * 0.137;
    return {
      leftOuterLift: Math.sin(time * 0.0017 + salt) * 0.025,
      rightOuterLift: Math.cos(time * 0.0015 + salt) * 0.022,
      leftTilt: Math.sin(time * 0.0011 + salt) * 0.018,
      rightTilt: Math.cos(time * 0.0012 + salt) * 0.018
    };
  }
}
