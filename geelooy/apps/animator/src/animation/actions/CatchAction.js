// B"H

/**
 * @file CatchAction.js
 * @description
 * ============================================================================
 * CHAPTER: THE CATCH THAT WAITED WITH TWO HANDS
 * ============================================================================
 */

export const CatchAction = {
  id: 'catch',

  /**
   * Samples catch.
   *
   * @returns {Object} Pose.
   */
  sample() {
    return {
      armElbowX: 30,
      armElbowY: -5,
      armHandX: 28,
      armHandY: -14,
      hipX: 0,
      kneeX: 0,
      ankleX: 0,
      footX: 0,
      kneeLift: -3,
      ankleLift: 0,
      bodyBob: -2,
      torsoLean: -1
    };
  }
};