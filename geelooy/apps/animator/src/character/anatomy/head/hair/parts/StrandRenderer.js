// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file StrandRenderer.js
 */
export class StrandRenderer {
  static build(id, points, color, width = 2) {
    return G.path(`strand_${id}`, points, {
      stroke: color,
      lineWidth: width,
      lineCap: 'round',
      lineJoin: 'round'
    });
  }
}
