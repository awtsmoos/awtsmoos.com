// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class CheekFeature {
  static draw(id, x, y, intensity) {
    const r = 12 + intensity * 5;
    return G.ellipse(`cheek_${id}`, x, y, r, r * 0.6, 0, { fill: `rgba(255, 100, 100, ${intensity * 0.3})` });
  }
}
