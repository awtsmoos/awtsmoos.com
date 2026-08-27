// B"H

/**
 * @file TalkAction.js
 * @description
 * ============================================================================
 * CHAPTER: THE SPEECH THAT MOVED ONE HAND WITH PURPOSE
 * ============================================================================
 */

export const TalkAction = {
  id: 'explain',

  /**
   * Samples talking.
   *
   * @param {Object} args - Sampling args.
   * @returns {Object} Pose.
   */
  sample({ time, side }) {
    const beat = Math.sin(time * 0.0048);
    const speakingHand = side > 0;

    if (speakingHand) {
      return {
        armElbowX: 30,
        armElbowY: 21 + beat * 4,
        armHandX: 25 + beat * 5,
        armHandY: 1 + Math.cos(time * 0.0052) * 4,
        hipX: 0,
        kneeX: 0,
        ankleX: 0,
        footX: 0,
        kneeLift: 0,
        ankleLift: 0,
        bodyBob: Math.sin(time * 0.002) * 0.9,
        torsoLean: beat * 0.4,
        headNod: Math.sin(time * 0.006) * 1.4
      };
    }

    return {
      armElbowX: 12,
      armElbowY: 42,
      armHandX: 8,
      armHandY: 32,
      hipX: 0,
      kneeX: 0,
      ankleX: 0,
      footX: 0,
      kneeLift: 0,
      ankleLift: 0,
      bodyBob: Math.sin(time * 0.002) * 0.6,
      torsoLean: 0,
      headNod: 0
    };
  }
};