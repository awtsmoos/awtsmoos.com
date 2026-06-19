
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file CavityRenderer.js
 * @description
 * THE INNER VOID.
 * B"H
 */
export class CavityRenderer {
  /**
   * Generates the deep oral darkness.
   */
  static build(lipPath) {
    return G.path('mouth_inner_void', lipPath, {
      fill: '#150105', // Deep midnight maroon
      stroke: 'none',
      alpha: 1.0 // Absolute opacity
    });
  }
}
