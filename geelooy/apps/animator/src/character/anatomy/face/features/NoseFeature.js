// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class NoseFeature {
  static draw(id, x, y, specs, skinColor) {
    const { width, height } = specs;
    return G.ellipse(`nose_${id}`, x, y, width, height, 0, { fill: skinColor, stroke: 'rgba(0,0,0,0.1)' });
  }
}
