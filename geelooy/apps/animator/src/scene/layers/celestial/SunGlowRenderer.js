
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file SunGlowRenderer.js
 * @description Renders sun glow rings separately from the sun disk.
 */

export class SunGlowRenderer {
  /**
   * Builds glow ring nodes.
   *
   * @param {Object} layout - Sun layout.
   * @param {Object} context - Scene context.
   * @returns {Array<Object>} Glow nodes.
   */
  static build(layout, context) {
    const rings = Math.max(1, Number(layout.glowRings) || 4);
    const nodes = [];

    for (let i = rings; i >= 1; i -= 1) {
      nodes.push(G.circle('sun_glow_ring_' + i, {
        x: layout.x,
        y: layout.y,
        radius: layout.radius * (1 + i * 0.48),
        fill: 'rgba(255,231,121,' + (0.06 + i * 0.025).toFixed(3) + ')'
      }));
    }

    return nodes;
  }
}
