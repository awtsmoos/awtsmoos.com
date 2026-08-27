
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file TreeCanopyRenderer.js
 * @description Tree leaf clusters.
 */

export class TreeCanopyRenderer {
  /**
   * Builds canopy nodes.
   *
   * @param {Object} layout - Tree layout.
   * @param {Object} context - Scene context.
   * @returns {Array<Object>} Canopy nodes.
   */
  static build(layout, context) {
    const blobs = [
      [-20, -54, 22],
      [0, -66, 25],
      [21, -53, 22],
      [-4, -43, 25]
    ];

    return blobs.map((blob, index) => G.circle(layout.id + '_canopy_' + index, {
      x: layout.x + blob[0] * layout.scale,
      y: layout.baseY + blob[1] * layout.scale,
      radius: blob[2] * layout.scale,
      fill: context.theme.leaf,
      stroke: context.theme.leafStroke,
      lineWidth: Math.max(1, 3 * layout.scale)
    }));
  }
}
