// B"H

/**
 * @file IdlePose.js
 * @description
 * Alive idle. Never dead standing.
 */
export class IdlePose {
  /**
   * Samples idle pose.
   *
   * @param {Object} data - Character data.
   * @param {Object} view - View profile.
   * @param {number} time - Render time.
   * @returns {Object} Pose.
   */
  static sample(data, view, time) {
    const s = Math.sin(time * 0.002 + (data._index || 0));
    return {
      action: 'idle',
      body: {
        bob: s * 1.2,
        torsoLean: s * 0.9,
        headNod: Math.sin(time * 0.0014) * 1.1,
        hipX: s * 1.2,
        shoulderX: -s * 0.9
      },
      legs: {
        left: { hipX: 0, kneeX: -2, ankleX: -3, footX: -5, kneeY: 0, ankleY: 0, footY: 0, footTilt: 0.02, planted: true },
        right: { hipX: 0, kneeX: 2, ankleX: 3, footX: 5, kneeY: 0, ankleY: 0, footY: 0, footTilt: -0.02, planted: true }
      },
      arms: {
        left: { elbowX: 13, elbowY: 42, handX: 8, handY: 34, shoulderLift: 0 },
        right: { elbowX: 13, elbowY: 42, handX: 8, handY: 34, shoulderLift: 0 }
      },
      face: {
        speaking: false
      }
    };
  }
}