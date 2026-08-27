
/**
 * @file TreeTipRegistry.js
 * @description
 * THE CONNECTION OF WORLDS (Ittachlut).
 * B"H
 * Solves the leaf-offset issue. Provides geometric coordination to ensure 
 * that leaf clusters are parented exactly at the terminus of their trunk branches.
 */
export class TreeTipRegistry {
  /**
   * Resolves the coordinate tip of a recursive branch segment.
   * @param {number} bx - Parent X.
   * @param {number} by - Parent Y.
   * @param {number} angle - Radiant direction.
   * @param {number} length - Measurement of growth.
   * @returns {Object} { x, y } absolute end-point.
   */
  static getBranchTip(bx, by, angle, length) {
    return {
      x: bx + Math.cos(angle) * length,
      y: by + Math.sin(angle) * length
    };
  }

  /**
   * Verifies Tip-to-Leaf binding.
   * Ensures the emanation group transform origin is zeroed relative 
   * to the parent tip, preventing disparate floating greenery.
   */
  static bindCanopy(tip, canopyId) {
    return {
      x: tip.x,
      y: tip.y,
      rotation: 0
    };
  }
}
