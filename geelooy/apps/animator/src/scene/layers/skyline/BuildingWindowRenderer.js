
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file BuildingWindowRenderer.js
 * @description Window generation for one building.
 */

export class BuildingWindowRenderer {
  /**
   * Builds building window nodes.
   *
   * @param {Object} layout - Building layout.
   * @param {Object} context - Scene context.
   * @returns {Array<Object>} Window nodes.
   */
  static build(layout, context) {
    const nodes = [];
    const theme = context.theme;
    let row = 0;

    for (let y = layout.y + 18; y < layout.y + layout.height - 14; y += 30) {
      let col = 0;
      for (let x = layout.x + 10; x < layout.x + layout.width - 8; x += 18) {
        nodes.push(G.rect(layout.id + '_window_' + row + '_' + col, {
          x,
          y,
          width: 5,
          height: 18,
          fill: (layout.index + row + col) % 4 === 0 ? theme.windowWarm : theme.windowCool
        }));
        col += 1;
      }
      row += 1;
    }

    return nodes;
  }
}
