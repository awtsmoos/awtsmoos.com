// B"H

/**
 * @file PoseDefaults.js
 * @description
 * Base whole-body pose object. Every layer adds to this same living body.
 */
export class PoseDefaults {
  /**
   * Creates default pose.
   *
   * @returns {Object} Pose.
   */
  static create() {
    return {
      action: 'layered',
      body: {
        bob: 0,
        torsoLean: 0,
        torsoTwist: 0,
        headNod: 0,
        headTurn: 0,
        hipX: 0,
        shoulderX: 0,
        breath: 0
      },
      legs: {
        left: this.leg(-1),
        right: this.leg(1)
      },
      arms: {
        left: this.arm(-1),
        right: this.arm(1)
      },
      face: {
        speaking: false,
        mouthShape: 'rest',
        mouthOpen: 0,
        smile: 0,
        browLift: 0,
        browPinch: 0,
        blink: 0,
        gazeX: 0,
        gazeY: 0,
        cheek: 0,
        jaw: 0
      },
      render: {
        detail: 'medium'
      }
    };
  }

  /**
   * Creates leg.
   *
   * @param {number} side - Side.
   * @returns {Object} Leg pose.
   */
  static leg(side) {
    return {
      hipX: side * 2,
      kneeX: side * 2,
      ankleX: side * 3,
      footX: side * 6,
      kneeY: 0,
      ankleY: 0,
      footY: 0,
      footTilt: side * 0.02,
      planted: true,
      contact: 1
    };
  }

  /**
   * Creates arm.
   *
   * @param {number} side - Side.
   * @returns {Object} Arm pose.
   */
  static arm(side) {
    return {
      elbowX: 13,
      elbowY: 42,
      handX: 8,
      handY: 34,
      shoulderLift: 0,
      wrist: 0,
      handShape: 'relaxed',
      lock: false
    };
  }
}