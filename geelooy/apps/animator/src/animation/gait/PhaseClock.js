// B"H
import { CycleMath } from '../math/CycleMath.js';

/**
 * @file PhaseClock.js
 * @description
 * ============================================================================
 * CHAPTER: THE CLOCK THAT MADE LEFT AND RIGHT DISAGREE BEAUTIFULLY
 * ============================================================================
 *
 * Both feet moving together is the mark of a broken walk. A real walk has
 * opposition: when one foot plants, the other travels. This clock gives each
 * side a true opposite phase.
 *
 * @class PhaseClock
 */
export class PhaseClock {
  /**
   * Samples a side-specific phase.
   *
   * @param {Object} args - Phase arguments.
   * @param {number} args.time - Render time in milliseconds.
   * @param {number} args.side - -1 left, 1 right.
   * @param {number} args.cyclesPerSecond - Animation speed.
   * @returns {number} Phase from 0 to 1.
   */
  static phase({ time, side, cyclesPerSecond }) {
    const seconds = (Number.isFinite(time) ? time : 0) / 1000;
    const sideOffset = side < 0 ? 0 : 0.5;
    return CycleMath.wrap01(seconds * cyclesPerSecond + sideOffset);
  }
}