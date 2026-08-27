// B"H
import { IdlePose } from './IdlePose.js';

/**
 * @file CatchPose.js
 * @description
 * Catch-ready and catch poses.
 */
export class CatchPose {
  /**
   * Samples catch pose.
   *
   * @param {Object} data - Character.
   * @param {Object} view - View.
   * @param {number} time - Time.
   * @param {string} kind - Catch phase.
   * @returns {Object} Pose.
   */
  static sample(data, view, time, kind) {
    const pose = IdlePose.sample(data, view, time);
    pose.action = kind;
    pose.body.torsoLean = data.flipX ? -1.8 : 1.8;

    pose.arms.left.elbowX = 34;
    pose.arms.left.elbowY = 20;
    pose.arms.left.handX = 32;
    pose.arms.left.handY = 8;

    pose.arms.right.elbowX = 34;
    pose.arms.right.elbowY = 20;
    pose.arms.right.handX = 32;
    pose.arms.right.handY = 8;

    if (kind === 'catch') {
      pose.body.bob -= 5;
      pose.body.headNod -= 2;
      pose.arms.left.handY -= 20;
      pose.arms.right.handY -= 20;
    }

    return pose;
  }
}