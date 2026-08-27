
// B"H

/**
 * @file CloudMotionSolver.js
 * @description Slow, deterministic cloud drift.
 */

export class CloudMotionSolver {
  /**
   * Resolves cloud X drift.
   *
   * @param {Object} data - Cloud data.
   * @param {Object} context - Scene context.
   * @returns {number} Drift x.
   */
  static driftX(data, context) {
    const drift = Number(data.drift || 0);
    const depth = Number(data.depth || 0.1);
    return Math.sin(context.realTime * drift + depth * 17) * context.contract.width * 0.018;
  }
}
