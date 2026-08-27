// B"H

/**
 * @file LegKinematics.js
 * @description
 * ============================================================================
 * CHAPTER: THE LEG THAT KEPT ITS BONES
 * ============================================================================
 *
 * A leg is hip, knee, ankle, foot. Not a rubber line. This module computes
 * stable points from gait pose, view spread, and depth.
 *
 * @class LegKinematics
 */
export class LegKinematics {
  /**
   * Builds leg points.
   *
   * @param {Object} args - Kinematic arguments.
   * @returns {Object} Hip, knee, ankle, foot points.
   */
  static points(args) {
    const { m, side, profile, pose, far } = args;
    const depth = far ? -profile.legDepth : profile.legDepth;
    const spread = m.hipHalf * 0.65 * profile.sideSpreadMultiplier;

    return {
      hip: {
        x: side * spread + depth + (pose.hipX || 0),
        y: m.hipY
      },
      knee: {
        x: side * spread * 0.82 + depth + (pose.kneeX || 0),
        y: m.kneeY + (pose.kneeLift || 0)
      },
      ankle: {
        x: side * spread * 0.72 + depth + (pose.ankleX || 0),
        y: m.ankleY + (pose.ankleLift || 0)
      },
      foot: {
        x: side * spread * 0.75 + depth + (pose.footX || 0),
        y: m.footY + (pose.ankleLift || 0) * 0.14
      }
    };
  }
}