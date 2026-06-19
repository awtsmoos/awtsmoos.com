// B"H
import { GaitSample } from '../gait/GaitSample.js';

/**
 * @file RunAction.js
 * @description
 * ============================================================================
 * CHAPTER: THE RUN THAT STOPPED SLIDING
 * ============================================================================
 */

export const RunAction = {
  id: 'run',

  /**
   * Samples run.
   *
   * @param {Object} args - Sampling args.
   * @returns {Object} Pose.
   */
  sample(args) {
    const gait = GaitSample.sample({ ...args, kind: 'run' });
    return {
      ...gait,
      armElbowX: 23 + Math.abs(gait.armSwing) * 0.16,
      armElbowY: 25 + gait.armSwing * 0.28,
      armHandX: 16 + Math.abs(gait.armSwing) * 0.1,
      armHandY: 18 - gait.armSwing * 0.34
    };
  }
};