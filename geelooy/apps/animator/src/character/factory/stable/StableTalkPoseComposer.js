// B"H
import { StableIdlePoseComposer } from './StableIdlePoseComposer.js';

/**
 * @file StableTalkPoseComposer.js
 * @description
 * ============================================================================
 * CHAPTER: THE TALKING BODY THAT GESTURES WITH PURPOSE
 * ============================================================================
 *
 * Talking should not randomly flap. It keeps legs planted, gives one hand a
 * deliberate gesture, and lets head/torso breathe.
 *
 * @class StableTalkPoseComposer
 */
export class StableTalkPoseComposer {
  /**
   * Samples talking.
   *
   * @param {number} time - Time.
   * @param {number} dir - Facing direction.
   * @returns {Object} Pose.
   */
  static sample(time = 0, dir = 1) {
    const pose = StableIdlePoseComposer.sample(time);
    const beat = Math.sin(time * 0.0047);
    const gestureSide = dir;

    pose.action = 'talk';
    pose.phaseName = 'talk';
    pose.body.bob = Math.sin(time * 0.002) * 0.9;
    pose.body.torsoLean = beat * 0.45 * dir;
    pose.body.headNod = Math.sin(time * 0.006) * 1.2;

    pose.arms[gestureSide < 0 ? 'left' : 'right'] = {
      elbowX: 29,
      elbowY: 19 + beat * 4,
      handX: 25 + beat * 5,
      handY: 2 + Math.cos(time * 0.0052) * 4,
      swing: 1,
      shoulderLift: -2
    };

    pose.arms[gestureSide < 0 ? 'right' : 'left'] = {
      elbowX: 11,
      elbowY: 42,
      handX: 8,
      handY: 33,
      swing: 0,
      shoulderLift: 1
    };

    return pose;
  }
}