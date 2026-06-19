// B"H

/**
 * @file WeightShiftSolver.js
 * @description
 * Shifts hips over planted foot so walking stops looking fake.
 */
export class WeightShiftSolver {
  /**
   * Computes body weight shift.
   *
   * @param {Object} cycle - Cycle.
   * @param {number} strength - Strength.
   * @returns {Object} Shift.
   */
  static solve(cycle, strength = 7) {
    const plantSide = cycle.rightPlant ? 1 : -1;
    const sway = Math.sin(cycle.phase * Math.PI);
    return {
      plantSide,
      swingSide: -plantSide,
      hipX: plantSide * strength * (0.55 + sway * 0.45),
      shoulderX: -plantSide * strength * 0.22,
      bob: -Math.abs(Math.sin(cycle.phase * Math.PI * 2)) * 2.4
    };
  }
}