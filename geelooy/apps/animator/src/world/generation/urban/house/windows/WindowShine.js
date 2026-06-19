
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

export class WindowShine {
  static build() {
    return G.path('glass_shine', [
      { type: 'move', x: 12, y: -17 }, { type: 'line', x: -12, y: 17 },
      { type: 'move', x: 12, y: 0 }, { type: 'line', x: -5, y: 17 }
    ], { stroke: 'rgba(255,255,255,0.5)', lineWidth: 4 });
  }
}
