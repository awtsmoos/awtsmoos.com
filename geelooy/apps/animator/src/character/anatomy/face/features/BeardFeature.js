// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class BeardFeature {
  static draw(id, x, y, color) {
    return G.ellipse(`beard_${id}`, x, y + 20, 45, 30, 0, { fill: color });
  }
}
