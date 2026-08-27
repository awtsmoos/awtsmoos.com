// B"H

/**
 * @file ArmKinematics.js
 * @description
 * ============================================================================
 * CHAPTER: THE ARM THAT ANSWERED THE STEP
 * ============================================================================
 *
 * Arms must counter-swing, gesture, throw, catch, or rest. This module turns
 * action pose numbers into shoulder, elbow, and hand points.
 *
 * @class ArmKinematics
 */
export class ArmKinematics {
  /**
   * Builds arm points.
   *
   * @param {Object} args - Kinematic arguments.
   * @returns {Object} Shoulder, elbow, and hand.
   */
  static points(args) {
    const { m, side, profile, pose, far } = args;
    const depth = far ? -profile.shoulderDepth : profile.shoulderDepth;
    const shoulder = {
      x: side * m.shoulderHalf + depth,
      y: m.shoulderY + 7
    };

    return {
      shoulder,
      elbow: {
        x: shoulder.x + side * (pose.armElbowX || 10),
        y: shoulder.y + (pose.armElbowY || 42)
      },
      hand: {
        x: shoulder.x + side * ((pose.armElbowX || 10) + (pose.armHandX || 7)),
        y: shoulder.y + (pose.armElbowY || 42) + (pose.armHandY || 32)
      }
    };
  }
}