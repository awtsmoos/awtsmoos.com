// B"H
import { StableIdlePoseComposer } from './StableIdlePoseComposer.js';

/**
 * @file StableThrowPoseComposer.js
 * @description
 * ============================================================================
 * CHAPTER: WINDUP, RELEASE, FOLLOW THROUGH
 * ============================================================================
 *
 * Throwing is separated into clear states. The renderer receives full-body
 * pose, not scattered arm numbers.
 *
 * @class StableThrowPoseComposer
 */
export class StableThrowPoseComposer {
  /**
   * Samples throw.
   *
   * @param {string} mode - throw_windup, throw_release, throw_follow, throw.
   * @param {number} time - Time.
   * @param {number} dir - Facing direction.
   * @returns {Object} Pose.
   */
  static sample(mode = 'throw_release', time = 0, dir = 1) {
    const pose = StableIdlePoseComposer.sample(time);
    pose.action = mode;
    pose.phaseName = mode;
    pose.body.bob = -1;
    pose.body.torsoLean = mode === 'throw_windup' ? -3 * dir : 3 * dir;
    pose.body.headNod = mode === 'throw_release' ? -2 : 0;

    const throwKey = dir < 0 ? 'left' : 'right';
    const restKey = dir < 0 ? 'right' : 'left';

    const states = {
      throw_windup: { elbowX: 18, elbowY: -32, handX: -12, handY: -34, shoulderLift: -5 },
      throw_release: { elbowX: 36, elbowY: -19, handX: 43, handY: -28, shoulderLift: -4 },
      throw_follow: { elbowX: 31, elbowY: 16, handX: 35, handY: 16, shoulderLift: 0 },
      throw: { elbowX: 36, elbowY: -19, handX: 43, handY: -28, shoulderLift: -4 }
    };

    pose.arms[throwKey] = {
      ...states[mode] || states.throw_release,
      swing: 1
    };

    pose.arms[restKey] = {
      elbowX: 12,
      elbowY: 42,
      handX: 8,
      handY: 33,
      swing: 0,
      shoulderLift: 1
    };

    pose.legs.left.kneeY = -1;
    pose.legs.right.kneeY = -1;
    pose.legs[dir < 0 ? 'left' : 'right'].footX = 4;
    pose.legs[dir < 0 ? 'right' : 'left'].footX = -3;

    return pose;
  }
}