// B"H
import { PoseRegistry } from './PoseRegistry.js';
import { IdlePose } from './poses/IdlePose.js';

/**
 * @file PoseResolver.js
 * @description
 * One active door from character state into whole-body pose.
 */
export class PoseResolver {
  /**
   * Resolves pose.
   *
   * @param {Object} data - Character data.
   * @param {Object} view - View profile.
   * @param {number} time - Render time.
   * @returns {Object} Whole body pose.
   */
  static resolve(data, view, time) {
    const action = data.acting || (data.isTalking ? 'explain' : 'listen_idle');
    const Pose = PoseRegistry[action] || IdlePose;
    const pose = Pose.sample(data, view, time);

    if (data.isTalking && pose.face) {
      pose.face.speaking = true;
    }

    return pose;
  }
}