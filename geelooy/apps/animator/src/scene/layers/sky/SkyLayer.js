
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SkyGradientRenderer } from './SkyGradientRenderer.js';

/**
 * @file SkyLayer.js
 * @description Sky layer wrapper.
 */

export class SkyLayer {
  /**
   * Builds the sky layer.
   *
   * @param {Object} context - Scene context.
   * @returns {Object} Sky graph group.
   */
  static build(context) {
    return G.group('sky_layer', null, [
      SkyGradientRenderer.build(context)
    ]);
  }
}
