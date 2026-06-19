// B"H
import { GaitSample } from '../gait/GaitSample.js';

/**
 * @file WalkAction.js
 * @description
 * ============================================================================
 * CHAPTER: THE WALK THAT ALTERNATED ITS FEET
 * ============================================================================
 */

export const WalkAction = {
  id: 'walk',

  /**
   * Samples walk.
   *
   * @param {Object} args - Sampling args.
   * @returns {Object} Pose.
   */
  sample(args) {
    const gait = GaitSample.sample({ ...args, kind: 'walk' });
    return {
      ...gait,
      armElbowX: 14 + Math.abs(gait.armSwing) * 0.12,
      armElbowY: 39 + gait.armSwing * 0.18,
      armHandX: 10 + Math.abs(gait.armSwing) * 0.08,
      armHandY: 30 - gait.armSwing * 0.22
    };
  }
};