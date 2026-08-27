
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { GraphKit } from '../GraphKit.js';

/**
 * @file CompactLimbs.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE LIMBS ARE SOCKETED AND GROUNDED
 * ═══════════════════════════════════════════════════════════════
 *
 * Arms and legs must not float. This module forces shoulder sockets, hip
 * sockets, knees, hands, and feet to visible stable points.
 *
 * @class CompactLimbs
 */
export class CompactLimbs {
  /**
   * Builds grounded legs.
   *
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @param {string} prefix - Node prefix.
   * @returns {Array<Object>} Nodes.
   */
  static legs(c, m, prefix) {
    return [-1, 1].flatMap(side => {
      const hx = side * (m.hipW || 44) * 0.34;
      const hy = m.hipY + 7;
      const kx = hx + side * 4;
      const ky = hy + m.legUpper;
      const fx = kx + side * 5;
      const fy = m.footY;

      return [
        ...GraphKit.limb(`${prefix}_upper_leg_${side}`, hx, hy, kx, ky, 17, c.pants, c.line),
        ...GraphKit.limb(`${prefix}_lower_leg_${side}`, kx, ky, fx, fy, 15, c.pantsShade || c.pants, c.line),
        G.circle(`${prefix}_knee_${side}`, kx, ky, 8, { fill: c.pants, stroke: c.line, lineWidth: 3 }),
        G.ellipse(`${prefix}_shoe_${side}`, fx + side * 7, fy + 7, 17, 7, 0, { fill: c.shoe, stroke: c.line, lineWidth: 3 })
      ];
    });
  }

  /**
   * Builds one socketed arm.
   *
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @param {string} prefix - Prefix.
   * @param {number} side - -1 or 1.
   * @param {string} colorKey - Clothing key.
   * @returns {Array<Object>} Nodes.
   */
  static arm(c, m, prefix, side, colorKey) {
    const sx = side * m.shoulderW / 2;
    const sy = m.shoulderY + 9;
    const ex = sx + side * 9;
    const ey = sy + m.armUpper;
    const hx = ex + side * 5;
    const hy = ey + m.armLower;
    const color = c[colorKey] || c.jacket || c.robe;

    return [
      ...GraphKit.limb(`${prefix}_upper_arm_${side}`, sx, sy, ex, ey, 19, color, c.line),
      ...GraphKit.limb(`${prefix}_lower_arm_${side}`, ex, ey, hx, hy, 16, color, c.line),
      G.circle(`${prefix}_elbow_${side}`, ex, ey, 9, { fill: color, stroke: c.line, lineWidth: 3 }),
      G.ellipse(`${prefix}_hand_${side}`, hx, hy + 7, 9, 12, side * 0.15, { fill: c.skin, stroke: c.line, lineWidth: 3 })
    ];
  }

  /**
   * Builds the far arm.
   *
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @param {number} dir - Facing direction.
   * @param {string} prefix - Prefix.
   * @param {string} colorKey - Color key.
   * @returns {Array<Object>} Nodes.
   */
  static backArm(c, m, dir, prefix, colorKey) {
    return this.arm(c, m, `${prefix}_back`, dir > 0 ? -1 : 1, colorKey);
  }

  /**
   * Builds the near arm.
   *
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @param {number} dir - Facing direction.
   * @param {string} prefix - Prefix.
   * @param {string} colorKey - Color key.
   * @returns {Array<Object>} Nodes.
   */
  static frontArm(c, m, dir, prefix, colorKey) {
    return this.arm(c, m, `${prefix}_front`, dir > 0 ? 1 : -1, colorKey);
  }
}
