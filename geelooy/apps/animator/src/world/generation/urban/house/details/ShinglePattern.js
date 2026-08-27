
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

export class ShinglePattern {
  static build(w, h, roofH) {
    return G.path('roof_shingles', [
      { type: 'move', x: -w/4, y: -h - roofH*0.5 }, { type: 'line', x: w/4, y: -h - roofH*0.5 }
    ], { stroke: 'rgba(255,255,255,0.2)', lineWidth: 2 });
  }
}
