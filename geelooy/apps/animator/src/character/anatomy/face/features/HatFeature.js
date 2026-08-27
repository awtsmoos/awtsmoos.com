// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class HatFeature {
  static draw(id, x, y, type) {
    return G.rect(`hat_${id}`, x - 30, y - 10, 60, 20, { fill: '#000' });
  }
}
