
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class AntennaArray
 * @description
 * THE SENSORS OF THE CITY.
 * B"H
 */
export class AntennaArray {
  static build(w, h) {
    // 1px thick geometric lines reaching into the sky
    return G.path('antenna', [
      { type: 'move', x: w * 0.7, y: -h - 10 },
      { type: 'line', x: w * 0.7, y: -h - 60 }
    ], { stroke: '#222', lineWidth: 3 });
  }
}
