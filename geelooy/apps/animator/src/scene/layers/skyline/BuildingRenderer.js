
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { BuildingWindowRenderer } from './BuildingWindowRenderer.js';

/**
 * @file BuildingRenderer.js
 * @description One building renderer.
 */

export class BuildingRenderer {
  /**
   * Builds one building.
   *
   * @param {Object} layout - Building layout.
   * @param {Object} context - Scene context.
   * @returns {Object} Building group.
   */
  static build(layout, context) {
    const theme = context.theme;

    return G.group(layout.id, null, [
      G.rect(layout.id + '_stroke', {
        x: layout.x - 4,
        y: layout.y - 5,
        width: layout.width + 8,
        height: layout.height + 5,
        fill: theme.buildingStroke
      }),
      G.rect(layout.id + '_body', {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
        fill: layout.index % 2 ? theme.buildingMid : theme.buildingDark
      }),
      ...BuildingWindowRenderer.build(layout, context)
    ]);
  }
}
