
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SunRenderer } from './SunRenderer.js';

/**
 * @file CelestialLayer.js
 * @description Dedicated celestial layer: sun, moon, stars later.
 */

const CELESTIAL_RENDERERS = {
  sun: SunRenderer
};

export class CelestialLayer {
  /**
   * Builds celestial components.
   *
   * @param {Object} context - Scene context.
   * @returns {Object} Celestial group.
   */
  static build(context) {
    const items = context.preset.celestial || [];
    const nodes = items
      .map(item => {
        const Renderer = CELESTIAL_RENDERERS[item.type];
        return Renderer ? Renderer.build(item, context) : null;
      })
      .filter(Boolean);

    return G.group('celestial_layer', null, nodes);
  }
}
