
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { TreeTrunkRenderer } from './TreeTrunkRenderer.js';
import { TreeCanopyRenderer } from './TreeCanopyRenderer.js';

/**
 * @file TreeRenderer.js
 * @description One tree from trunk + canopy files.
 */

export class TreeRenderer {
  /**
   * Builds one tree.
   *
   * @param {Object} layout - Tree layout.
   * @param {Object} context - Scene context.
   * @returns {Object} Tree group.
   */
  static build(layout, context) {
    return G.group(layout.id, null, [
      TreeTrunkRenderer.build(layout, context),
      ...TreeCanopyRenderer.build(layout, context)
    ]);
  }
}
