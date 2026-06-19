
// B"H

/**
 * @file FootLockSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE PLANTED FOOT THAT WOULD NOT SLIDE
 * ============================================================================
 *
 * Sliding feet kill walking realism. This solver marks plant windows and
 * computes a locked contact strength so future IK can keep the planted foot
 * nailed to the ground until lift-off.
 *
 * @module FootLockSolver
 */

/**
 * @class FootLockSolver
 * @description
 * Computes foot lock state.
 */
export class FootLockSolver {
  /**
   * Samples foot lock.
   *
   * @param {number} phase - Normalized phase.
   * @param {Object} style - Walk style.
   * @returns {Object} Foot lock data.
   */
  static sample(phase, style = {}) {
    const contact = Number(style.contact) || 0.58;
    const p = ((phase % 1) + 1) % 1;
    const planted = p < contact;
    const edge = planted ? Math.min(p / 0.08, (contact - p) / 0.08) : 0;
    return {
      planted,
      lockStrength: Math.max(0, Math.min(1, edge)),
      swing: planted ? 0 : (p - contact) / Math.max(0.001, 1 - contact)
    };
  }
}
