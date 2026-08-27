// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class ScleraGeometry {
  static generateClipPoints(w, hC) {
    return [
      { type: 'move', x: -w, y: 0 },
      { type: 'bezier', c1x: -w, c1y: -hC, c2x: w, c2y: -hC, x: w, y: 0 },
      { type: 'bezier', c1x: w, c1y: hC, c2x: -w, c2y: hC, x: -w, y: 0 },
      { type: 'close' }
    ];
  }

  static generateBase(w, hC) {
    return G.ellipse('sclera_bg', 0, 0, w, hC, 0, { fill: '#ffffff', stroke: '#000', lineWidth: 2 });
  }

  static generateOutline(clipPoints) {
    return G.path('sclera_outline', clipPoints, { stroke: '#000', lineWidth: 2.5 });
  }
}
