// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class MouthFeature {
  static draw(id, x, y, open, specs) {
    const { baseWidth, maxHeight } = specs;
    const currentH = Math.max(2, open * maxHeight);
    return G.ellipse(`mouth_${id}`, x, y, baseWidth, currentH, 0, { fill: '#000' });
  }
}
