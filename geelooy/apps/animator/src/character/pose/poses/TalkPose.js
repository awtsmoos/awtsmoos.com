// B"H
import { IdlePose } from './IdlePose.js';

/**
 * @file TalkPose.js
 * @description
 * Speaker pose: one hand gestures, torso leans, head engages.
 */
export class TalkPose {
  /**
   * Samples talk/explain/open-hand pose.
   *
   * @param {Object} data - Character data.
   * @param {Object} view - View.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static sample(data, view, time) {
    const base = IdlePose.sample(data, view, time);
    const wave = Math.sin(time * 0.004 + (data._index || 0));
    const rightActive = !data.flipX;

    base.action = 'talk';
    base.face.speaking = true;
    base.body.torsoLean += rightActive ? -1.6 : 1.6;
    base.body.headNod += Math.sin(time * 0.006) * 1.8;

    const arm = rightActive ? base.arms.right : base.arms.left;
    arm.elbowX = 32 + wave * 8;
    arm.elbowY = 20 + wave * 5;
    arm.handX = 26 + wave * 7;
    arm.handY = 2 + wave * 6;
    arm.shoulderLift = -3;

    return base;
  }
}