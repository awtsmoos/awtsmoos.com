
// B"H
import { WALK_STYLE_REGISTRY } from './WalkStyleRegistry.js';
import { FootLockSolver } from './FootLockSolver.js';

/**
 * @file WalkCycleSolver.js
 * @description
 * ============================================================================
 * CHAPTER: CONTACT, DOWN, PASSING, UP — THE FOUR GATES OF WALKING
 * ============================================================================
 *
 * A walk is not a noodle swing. It is a cycle of contact, weight, passing, and
 * lift. This solver gives each foot phase, stride, lift, knee, hip sway, arm
 * counter-swing, and planted lock strength.
 *
 * @module WalkCycleSolver
 */

/**
 * @class WalkCycleSolver
 * @description
 * Samples realistic walking data.
 */
export class WalkCycleSolver {
  /**
   * Samples one side of a walk.
   *
   * @param {Object} args - Sampling arguments.
   * @returns {Object} Walk data.
   */
  static sample(args = {}) {
    const time = Number(args.time) || 0;
    const side = args.side < 0 ? -1 : 1;
    const style = WALK_STYLE_REGISTRY[args.style || 'calmWalk'] || WALK_STYLE_REGISTRY.calmWalk;
    const seconds = time / 1000;
    const phase = (seconds * style.speed + (side < 0 ? 0 : 0.5)) % 1;
    const lock = FootLockSolver.sample(phase, style);
    const wave = Math.cos(phase * Math.PI * 2);
    const lift = lock.planted ? 0 : Math.sin(lock.swing * Math.PI) * style.lift;

    return {
      phase,
      planted: lock.planted,
      lockStrength: lock.lockStrength,
      stride: wave * style.stride,
      lift,
      knee: lift * 1.35,
      hip: Math.sin(phase * Math.PI * 2) * style.hip,
      shoulder: -Math.sin(phase * Math.PI * 2) * style.shoulder,
      headBob: Math.abs(Math.sin(phase * Math.PI * 2)) * (1 - style.headStability) * -5
    };
  }
}
