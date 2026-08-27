// B"H

/**
 * @file IdleAction.js
 * @description
 * ============================================================================
 * CHAPTER: THE STILLNESS THAT BREATHED QUIETLY
 * ============================================================================
 */

export const IdleAction = {
  id: 'idle',

  /**
   * Samples idle.
   *
   * @param {Object} args - Sampling args.
   * @param {number} args.time - Time.
   * @param {number} args.side - Side.
   * @returns {Object} Pose.
   */
  sample({ time, side }) {
    const drift = Math.sin(time * 0.0018 + (side < 0 ? Math.PI : 0));
    return {
      armElbowX: 10,
      armElbowY: 43 + drift,
      armHandX: 7,
      armHandY: 34 + drift * 1.5,
      hipX: 0,
      kneeX: 0,
      ankleX: 0,
      footX: 0,
      kneeLift: 0,
      ankleLift: 0,
      bodyBob: Math.sin(time * 0.0012) * 0.8,
      torsoLean: 0
    };
  }
};