
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { ParkLayoutSolver } from './ParkLayoutSolver.js';
import { TreeRenderer } from './TreeRenderer.js';

/**
 * @file ParkLayer.js
 * @description Sidewalk, grass, and tree layer.
 */

export class ParkLayer {
  /**
   * Builds park layer.
   *
   * @param {Object} context - Scene context.
   * @returns {Object} Park group.
   */
  static build(context) {
    const { contract, theme } = context;
    const trees = ParkLayoutSolver.trees(context).map(tree => TreeRenderer.build(tree, context));

    return G.group('park_layer', null, [
      G.rect('sidewalk_full_width', {
        x: 0,
        y: contract.sidewalkTopY,
        width: contract.width,
        height: contract.roadTopY - contract.sidewalkTopY,
        fill: theme.sidewalk
      }),
      G.rect('grass_strip_full_width', {
        x: 0,
        y: contract.roadTopY - 10,
        width: contract.width,
        height: 10,
        fill: theme.grass
      }),
      ...trees
    ]);
  }
}
