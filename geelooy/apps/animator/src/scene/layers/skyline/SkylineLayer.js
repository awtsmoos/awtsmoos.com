
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SkylineLayoutSolver } from './SkylineLayoutSolver.js';
import { BuildingRenderer } from './BuildingRenderer.js';

/**
 * @file SkylineLayer.js
 * @description Modular skyline layer.
 */

export class SkylineLayer {
  /**
   * Builds skyline layer.
   *
   * @param {Object} context - Scene context.
   * @returns {Object} Skyline group.
   */
  static build(context) {
    const buildings = SkylineLayoutSolver.resolve(context).map(layout => BuildingRenderer.build(layout, context));
    return G.group('skyline_layer', null, buildings);
  }
}
