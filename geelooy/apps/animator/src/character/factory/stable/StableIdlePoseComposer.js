// B"H

/**
 * @file StableIdlePoseComposer.js
 * @description
 * ============================================================================
 * CHAPTER: THE STILL BODY THAT BREATHES WITHOUT BREAKING THE RIG
 * ============================================================================
 *
 * Idle returns a full pose exactly like walk/run so the renderer never has to
 * guess missing fields. Every limb has a defined position.
 *
 * @class StableIdlePoseComposer
 */
export class StableIdlePoseComposer {
  /**
   * Samples idle.
   *
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static sample(time = 0) {
    const breath = Math.sin(time * 0.0015);
    return {
      action: 'idle',
      phase: 0,
      phaseName: 'idle',
      body: {
        bob: breath * 0.8,
        torsoLean: breath * 0.15,
        headNod: breath * 0.5
      },
      legs: {
        left: this.leg(-1),
        right: this.leg(1)
      },
      arms: {
        left: this.arm(-1, breath),
        right: this.arm(1, -breath)
      }
    };
  }

  /**
   * Idle leg.
   *
   * @param {number} side - Side.
   * @returns {Object} Leg pose.
   */
  static leg(side) {
    return {
      role: 'idle',
      hipX: 0,
      kneeX: side * 1.5,
      ankleX: side * 1,
      footX: side * 1,
      kneeY: 0,
      ankleY: 0,
      footY: 0,
      footTilt: 0,
      planted: true,
      alphaBoost: 1
    };
  }

  /**
   * Idle arm.
   *
   * @param {number} side - Side.
   * @param {number} breath - Breath wave.
   * @returns {Object} Arm pose.
   */
  static arm(side, breath) {
    return {
      elbowX: 10,
      elbowY: 43 + breath,
      handX: 7,
      handY: 34 + breath * 1.4,
      swing: 0,
      shoulderLift: breath * 0.6
    };
  }
}