// B"H
import { TalkPose } from './TalkPose.js';

/**
 * @file GesturePose.js
 * @description
 * Pointing and open-hand dialogue gestures.
 */
export class GesturePose {
  /**
   * Samples gesture pose.
   *
   * @param {Object} data - Character.
   * @param {Object} view - View.
   * @param {number} time - Time.
   * @param {string} kind - Gesture kind.
   * @returns {Object} Pose.
   */
  static sample(data, view, time, kind) {
    const pose = TalkPose.sample(data, view, time);
    const rightActive = !data.flipX;
    const arm = rightActive ? pose.arms.right : pose.arms.left;

    if (kind === 'point') {
      arm.elbowX = 42;
      arm.elbowY = 16;
      arm.handX = 38;
      arm.handY = 3;
    }

    if (kind === 'open_hand') {
      arm.elbowX = 35;
      arm.elbowY = 28;
      arm.handX = 35;
      arm.handY = 12;
    }

    return pose;
  }
}