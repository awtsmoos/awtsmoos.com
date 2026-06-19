
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SunGlowRenderer } from './SunGlowRenderer.js';

/**
 * @file SunRenderer.js
 * @description Single sun renderer, independent from sky/cloud/building files.
 */

export class SunRenderer {
  /**
   * Builds the sun component.
   *
   * @param {Object} data - Sun schema.
   * @param {Object} context - Scene context.
   * @returns {Object} Sun group.
   */
  static build(data, context) {
    const { contract, theme } = context;
    const layout = {
      x: contract.width * Number(data.xRatio ?? 0.82),
      y: contract.horizonY * Number(data.yRatio ?? 0.26),
      radius: contract.width * Number(data.radiusRatio ?? 0.045),
      glowRings: data.glowRings || 5
    };

    return G.group(data.id || 'sun_main', null, [
      ...SunGlowRenderer.build(layout, context),
      G.circle((data.id || 'sun_main') + '_disk', {
        x: layout.x,
        y: layout.y,
        radius: layout.radius,
        fill: theme.sun || '#ffe779'
      })
    ]);
  }
}
