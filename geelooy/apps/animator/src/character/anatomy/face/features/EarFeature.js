// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class EarFeature {
  static draw(side, x, y, skinColor) {
    return G.ellipse(`ear_${side}`, x, y, 12, 18, 0, { fill: skinColor, stroke: 'rgba(0,0,0,0.1)' });
  }
}
