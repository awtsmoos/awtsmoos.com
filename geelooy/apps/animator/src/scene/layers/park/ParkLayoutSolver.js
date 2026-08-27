
// B"H

/**
 * @file ParkLayoutSolver.js
 * @description Lays out park trees.
 */

export class ParkLayoutSolver {
  /**
   * Resolves tree layouts.
   *
   * @param {Object} context - Scene context.
   * @returns {Array<Object>} Tree layouts.
   */
  static trees(context) {
    const { contract, preset } = context;
    const cfg = preset.park || {};
    const count = Math.max(3, Number(cfg.treeCount || 7));
    const baseY = contract.resolveY(cfg.baseY || 'roadTopY');

    return Array.from({ length: count }, (_, index) => ({
      id: 'tree_' + index,
      x: (index + 0.45) * (contract.width / count),
      baseY: baseY - 8,
      scale: 0.62 + (index % 3) * 0.08
    }));
  }
}
