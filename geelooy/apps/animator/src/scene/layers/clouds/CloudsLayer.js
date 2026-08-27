
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { CloudRenderer } from './CloudRenderer.js';

/**
 * @file CloudsLayer.js
 * @description Modular cloud layer.
 */

export class CloudsLayer {
  /**
   * Builds all clouds.
   *
   * @param {Object} context - Scene context.
   * @returns {Object} Cloud group.
   */
  static build(context) {
    const nodes = (context.preset.clouds || []).map(cloud => CloudRenderer.build(cloud, context));
    return G.group('clouds_layer', null, nodes);
  }
}
