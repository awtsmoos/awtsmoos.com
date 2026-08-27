
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

export class HouseStruct {
  static build(w, h, color) {
    return G.rect('base', -w/2, -h, w, h, { fill: color, stroke: '#000', lineWidth: 4 });
  }
}
