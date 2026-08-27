// B"H

/**
 * @file ThrowAction.js
 * @description
 * ============================================================================
 * CHAPTER: THE THROW WITH WINDUP, RELEASE, AND FOLLOW-THROUGH
 * ============================================================================
 */

export const ThrowAction = {
  id: 'throw',

  /**
   * Samples throw pose.
   *
   * @param {Object} args - Sampling args.
   * @param {number} args.side - Side.
   * @returns {Object} Pose.
   */
  sample({ side }) {
    if (side > 0) {
      return {
        armElbowX: 34,
        armElbowY: -18,
        armHandX: 40,
        armHandY: -26,
        hipX: 0,
        kneeX: 3,
        ankleX: 2,
        footX: 4,
        kneeLift: -2,
        ankleLift: 0,
        bodyBob: -1,
        torsoLean: 3
      };
    }

    return {
      armElbowX: 13,
      armElbowY: 43,
      armHandX: 8,
      armHandY: 31,
      hipX: 0,
      kneeX: -2,
      ankleX: -1,
      footX: -2,
      kneeLift: 0,
      ankleLift: 0,
      bodyBob: -1,
      torsoLean: 0
    };
  }
};