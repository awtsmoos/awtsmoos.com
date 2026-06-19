// B"H
import { IdlePose } from './IdlePose.js';

/**
 * @file ThrowPose.js
 * @description
 * Windup, release, and follow-through poses.
 */
export class ThrowPose {
  /**
   * Samples throw pose.
   *
   * @param {Object} data - Character.
   * @param {Object} view - View.
   * @param {number} time - Time.
   * @param {string} kind - Throw phase.
   * @returns {Object} Pose.
   */
  static sample(data, view, time, kind) {
    const pose = IdlePose.sample(data, view, time);
    const active = !data.flipX ? pose.arms.right : pose.arms.left;

    pose.action = kind;
    pose.body.torsoLean = data.flipX ? -3.5 : 3.5;
    pose.body.headNod = -2;

    if (kind === 'throw_windup') {
      active.elbowX = -10;
      active.elbowY = -34;
      active.handX = -18;
      active.handY = -54;
      active.shoulderLift = -7;
    } else if (kind === 'throw_release') {
      active.elbowX = 46;
      active.elbowY = -20;
      active.handX = 58;
      active.handY = -32;
      active.shoulderLift = -9;
    } else {
      active.elbowX = 52;
      active.elbowY = 12;
      active.handX = 62;
      active.handY = 8;
      active.shoulderLift = -4;
    }

    return pose;
  }
}