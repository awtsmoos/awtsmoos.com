// B"H

/**
 * @file PointAction.js
 * @description
 * ============================================================================
 * CHAPTER: THE POINT THAT LOCKED ONTO A TARGET
 * ============================================================================
 */

export const PointAction = {
  id: 'point',

  /**
   * Samples point.
   *
   * @param {Object} args - Sampling args.
   * @param {number} args.side - Side.
   * @returns {Object} Pose.
   */
  sample({ side }) {
    if (side > 0) {
      return {
        armElbowX: 34,
        armElbowY: 18,
        armHandX: 42,
        armHandY: 2,
        hipX: 0,
        kneeX: 0,
        ankleX: 0,
        footX: 0,
        kneeLift: 0,
        ankleLift: 0,
        bodyBob: 0,
        torsoLean: 1
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