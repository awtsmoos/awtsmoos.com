// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class ShoulderVessel {
  static build(side, x, y, color) {
    return G.ellipse(`shoulder_pad_${side}`, x, y, 18, 12, 0, { fill: color, stroke: '#000', lineWidth: 3 });
  }
}
