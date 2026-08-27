// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class NeckVessel {
  static build(x, y, color) {
    return G.rect('neck_vessel', x - 8, y, 16, 25, { fill: color, stroke: '#000', lineWidth: 3 });
  }
}
