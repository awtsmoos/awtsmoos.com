// B"H
import { StableIdlePoseComposer } from './StableIdlePoseComposer.js';

/**
 * @file StableCatchPoseComposer.js
 * @description
 * ============================================================================
 * CHAPTER: THE CATCHER WHO MAKES THE PROP READ
 * ============================================================================
 *
 * Catching brings both hands forward, bends knees slightly, and holds an
 * anticipatory body shape.
 *
 * @class StableCatchPoseComposer
 */
export class StableCatchPoseComposer {
  /**
   * Samples catch pose.
   *
   * @param {number} time - Time.
   * @param {number} dir - Facing direction.
   * @returns {Object} Pose.
   */
  static sample(time = 0, dir = 1) {
    const pose = StableIdlePoseComposer.sample(time);
    pose.action = 'catch';
    pose.phaseName = 'catch';
    pose.body.bob = -3;
    pose.body.torsoLean = -1.2 * dir;
    pose.body.headNod = -1;

    pose.arms.left = {
      elbowX: 26,
      elbowY: -4,
      handX: 25,
      handY: -12,
      swing: 1,
      shoulderLift: -2
    };

    pose.arms.right = {
      elbowX: 26,
      elbowY: -4,
      handX: 25,
      handY: -12,
      swing: 1,
      shoulderLift: -2
    };

    pose.legs.left.kneeY = 3;
    pose.legs.right.kneeY = 3;

    return pose;
  }
}