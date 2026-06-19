
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file SkyGradientRenderer.js
 * @description
 * Dedicated full-stage sky renderer.
 */

/**
 * @class SkyGradientRenderer
 * @description
 * Builds sky as two graph rectangles because the graph renderer may not support
 * gradients, but it must always cover the top world.
 */
export class SkyGradientRenderer {
  /**
   * Builds full-width sky nodes.
   *
   * @param {Object} context - Scene context.
   * @returns {Object} Sky group.
   */
  static build(context) {
    const { contract, theme } = context;

    return G.group('sky_gradient_full_cover_group', null, [
      G.rect('sky_gradient_top_full_cover', {
        x: 0,
        y: 0,
        width: contract.width,
        height: contract.horizonY * 0.58,
        fill: theme.skyTop || '#2384aa'
      }),
      G.rect('sky_gradient_bottom_full_cover', {
        x: 0,
        y: contract.horizonY * 0.58,
        width: contract.width,
        height: contract.horizonY * 0.42,
        fill: theme.skyBottom || '#58bdd4'
      })
    ]);
  }
}
