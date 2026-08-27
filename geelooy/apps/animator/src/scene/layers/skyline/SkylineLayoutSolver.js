
// B"H

/**
 * @file SkylineLayoutSolver.js
 * @description Converts skyline preset data into building rectangles.
 */

export class SkylineLayoutSolver {
  /**
   * Resolves building layouts.
   *
   * @param {Object} context - Scene context.
   * @returns {Array<Object>} Building layouts.
   */
  static resolve(context) {
    const { contract, preset } = context;
    const cfg = preset.skyline || {};
    const count = Math.max(3, Number(cfg.count || 9));
    const baseY = contract.resolveY(cfg.baseY || 'sidewalkTopY');
    const minH = contract.height * Number(cfg.minHeightRatio || 0.14);
    const maxH = contract.height * Number(cfg.maxHeightRatio || 0.32);
    const step = contract.width / count;

    return Array.from({ length: count }, (_, index) => {
      const width = Math.max(28, step * (0.58 + (index % 3) * 0.12));
      const height = minH + ((index * 41) % Math.max(1, maxH - minH));
      return {
        id: 'building_' + index,
        x: index * step - width * 0.15,
        y: baseY - height,
        width,
        height,
        index,
        baseY
      };
    });
  }
}
