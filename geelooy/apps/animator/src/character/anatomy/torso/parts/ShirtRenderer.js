// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file ShirtRenderer.js
 */
export class ShirtRenderer {
  static build(yCenter, h) {
    return G.path('white_shirt', [
      { type: 'move', x: -10, y: yCenter - h/2 },
      { type: 'line', x: 10, y: yCenter - h/2 },
      { type: 'line', x: 0, y: yCenter - h/2 + 25 }
    ], { fill: '#fff' });
  }
}
