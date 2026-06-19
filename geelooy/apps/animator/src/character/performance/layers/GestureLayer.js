
// B"H

/**
 * @file GestureLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE QUIET GESTURE LAYER THAT NO LONGER BREAKS THE BODY
 * ============================================================================
 *
 * This layer exposes static apply/sample only. It is safe to import as a class
 * and never needs construction with new. Advanced gestures can return later;
 * this first fix keeps the render stable.
 *
 * @module GestureLayer
 */

/**
 * @class GestureLayer
 * @description
 * Safe gesture performance layer.
 */
export class GestureLayer {
  /**
   * Applies gesture data.
   *
   * @param {Object} pose - Pose object.
   * @param {Object} state - Performance state.
   * @param {Object} view - View data.
   * @param {number} time - Render time.
   * @param {Object} world - World data.
   * @returns {Object} Pose.
   */
  static apply(pose, state, view, time, world = {}) {
    const gesture = state.gesture || state.raw?.gesture || state.raw?.currentPerformance?.gesture || 'none';
    pose.arms = pose.arms || { left: {}, right: {} };
    pose.arms.left = pose.arms.left || {};
    pose.arms.right = pose.arms.right || {};

    if (gesture === 'wave') {
      pose.arms.right.elbowX = 24;
      pose.arms.right.elbowY = -18;
      pose.arms.right.handX = 18 + Math.sin(time * 0.011) * 8;
      pose.arms.right.handY = -44;
    } else if (gesture === 'point') {
      pose.arms.right.elbowX = 34;
      pose.arms.right.elbowY = 10;
      pose.arms.right.handX = 44;
      pose.arms.right.handY = -4;
    } else if (gesture === 'explain') {
      pose.arms.right.elbowX = 28;
      pose.arms.right.elbowY = 20 + Math.sin(time * 0.005) * 5;
      pose.arms.right.handX = 26 + Math.cos(time * 0.004) * 6;
      pose.arms.right.handY = 4 + Math.sin(time * 0.006) * 5;
    }

    return pose;
  }

  /**
   * Sample-compatible layer entry.
   *
   * @param {Object} args - Runner args.
   * @returns {Object} Pose.
   */
  static sample(args = {}) {
    return this.apply(args.pose || {}, args.state || {}, args.view || {}, args.time || 0, args.world || {});
  }
}
