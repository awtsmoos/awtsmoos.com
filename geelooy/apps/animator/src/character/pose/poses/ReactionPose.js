// B"H
import { IdlePose } from './IdlePose.js';

/**
 * @file ReactionPose.js
 * @description
 * Listener reaction poses.
 */
export class ReactionPose {
  /**
   * Samples reaction pose.
   *
   * @param {Object} data - Character.
   * @param {Object} view - View.
   * @param {number} time - Time.
   * @param {string} kind - Reaction kind.
   * @returns {Object} Pose.
   */
  static sample(data, view, time, kind) {
    const pose = IdlePose.sample(data, view, time);
    const nod = Math.sin(time * 0.012) * 2.5;

    pose.action = kind;
    pose.body.headNod += kind === 'react_nod' ? nod : 0;
    pose.body.torsoLean += data.flipX ? -1.1 : 1.1;

    if (kind === 'react_smile') {
      pose.face.smileBoost = 1;
    }

    if (kind === 'look_action') {
      pose.body.torsoLean += data.flipX ? -2.5 : 2.5;
      pose.arms.left.elbowY = 35;
      pose.arms.right.elbowY = 35;
    }

    return pose;
  }
}