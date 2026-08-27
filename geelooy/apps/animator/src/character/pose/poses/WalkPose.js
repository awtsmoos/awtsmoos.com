// B"H
import { StableWalkPoseComposer } from '../../factory/stable/StableWalkPoseComposer.js';

/**
 * @file WalkPose.js
 * @description
 * Visible walk pose. It deliberately amplifies leg offsets so the screenshot
 * proves alternating feet before subtle polish begins.
 */
export class WalkPose {
  /**
   * Samples walk pose.
   *
   * @param {Object} data - Character data.
   * @param {Object} view - View.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static sample(data, view, time) {
    const dir = data.flipX ? -1 : 1;
    const pose = StableWalkPoseComposer.sample(time + (data._index || 0) * 137, dir);
    const amp = view.type === 'side' ? 1.85 : view.type === 'threeQuarter' ? 1.55 : 1.25;

    ['left', 'right'].forEach(side => {
      const leg = pose.legs[side];
      leg.kneeX *= amp;
      leg.ankleX *= amp;
      leg.footX *= amp;
      leg.kneeY *= 1.25;
      leg.ankleY *= 1.25;
      leg.footY *= 1.25;
    });

    pose.body.hipX *= 1.45;
    pose.body.shoulderX *= 1.25;
    pose.body.bob *= 1.35;
    pose.arms.left.elbowX *= 1.35;
    pose.arms.right.elbowX *= 1.35;

    return pose;
  }
}