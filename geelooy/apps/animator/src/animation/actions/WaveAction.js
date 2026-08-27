// B"H

/**
 * @file WaveAction.js
 * @description
 * ============================================================================
 * CHAPTER: THE WAVE THAT CHOSE ONE HAND AND HELD ITS RHYTHM
 * ============================================================================
 */

export const WaveAction = {
  id: 'wave',

  /**
   * Samples wave.
   *
   * @param {Object} args - Sampling args.
   * @param {number} args.time - Time.
   * @param {number} args.side - Side.
   * @returns {Object} Pose.
   */
  sample({ time, side }) {
    if (side > 0) {
      return {
        armElbowX: 24,
        armElbowY: -13,
        armHandX: 18 + Math.sin(time * 0.011) * 8,
        armHandY: -44,
        hipX: 0,
        kneeX: 0,
        ankleX: 0,
        footX: 0,
        kneeLift: 0,
        ankleLift: 0,
        bodyBob: 0,
        torsoLean: 0
      };
    }

    return {
      armElbowX: 10,
      armElbowY: 43,
      armHandX: 7,
      armHandY: 33,
      hipX: 0,
      kneeX: 0,
      ankleX: 0,
      footX: 0,
      kneeLift: 0,
      ankleLift: 0,
      bodyBob: 0,
      torsoLean: 0
    };
  }
};