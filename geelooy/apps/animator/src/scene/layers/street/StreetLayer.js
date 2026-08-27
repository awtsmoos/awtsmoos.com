
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { RoadRenderer } from './RoadRenderer.js';

/**
 * @file StreetLayer.js
 * @description Street layer wrapper.
 */

export class StreetLayer {
  /**
   * Builds street layer.
   *
   * @param {Object} context - Scene context.
   * @returns {Object} Street group.
   */
  static build(context) {
    return G.group('street_layer', null, [
      RoadRenderer.build(context)
    ]);
  }
}
