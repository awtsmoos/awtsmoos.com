
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file TreeTrunkRenderer.js
 * @description Tree trunk renderer.
 */

export class TreeTrunkRenderer {
  /**
   * Builds trunk node.
   *
   * @param {Object} layout - Tree layout.
   * @param {Object} context - Scene context.
   * @returns {Object} Trunk node.
   */
  static build(layout, context) {
    return G.rect(layout.id + '_trunk', {
      x: layout.x - 6 * layout.scale,
      y: layout.baseY - 46 * layout.scale,
      width: 12 * layout.scale,
      height: 46 * layout.scale,
      fill: context.theme.trunk
    });
  }
}
