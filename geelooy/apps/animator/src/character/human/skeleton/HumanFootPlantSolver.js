
// B"H

/**
 * @file HumanFootPlantSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE FOOT THAT SWORE NOT TO SLIDE
 * ============================================================================
 *
 * Walking becomes mud when both feet skate. This solver gives each foot a
 * phase, plant state, stride offset, lift, and knee impulse. It is simple,
 * deterministic, and data-based, ready to be replaced by deeper IK without
 * breaking the rest of the skeleton.
 *
 * @module HumanFootPlantSolver
 */

/**
 * @class HumanFootPlantSolver
 * @description
 * Produces readable walking phases for each side.
 */
export class HumanFootPlantSolver {
  /**
   * Samples one foot.
   *
   * @param {Object} args - Sampling arguments.
   * @param {number} args.time - Time in milliseconds.
   * @param {number} args.side - -1 for left, 1 for right.
   * @param {Object} args.motion - Motion profile values.
   * @param {string} args.action - Locomotion action.
   * @returns {Object} Foot phase data.
   */
  static sample({ time = 0, side = 1, motion = {}, action = 'idle' }) {
    if (action !== 'walk' && action !== 'run' && action !== 'dance') {
      return { phase: 0, planted: true, stride: 0, lift: 0, knee: 0, hip: 0 };
    }

    const speedMap = { walk: 1.55, run: 2.85, dance: 2.05 };
    const strideMap = { walk: 30, run: 48, dance: 38 };
    const liftMap = { walk: 10, run: 22, dance: 18 };
    const seconds = time / 1000;
    const phase = (seconds * (speedMap[action] || 1.55) + (side < 0 ? 0 : 0.5)) % 1;
    const planted = phase < 0.16 || phase > 0.66;
    const wave = Math.cos(phase * Math.PI * 2);
    const swingRaw = planted ? 0 : (phase - 0.16) / 0.5;
    const swing = Math.max(0, Math.min(1, swingRaw));
    const lift = planted ? 0 : Math.sin(swing * Math.PI) * liftMap[action] * (motion.lift || 1);
    const stride = wave * strideMap[action] * (motion.stride || 1);

    return {
      phase,
      planted,
      stride,
      lift,
      knee: lift * 1.25,
      hip: Math.sin(phase * Math.PI * 2) * 4 * (motion.sway || 1)
    };
  }
}
