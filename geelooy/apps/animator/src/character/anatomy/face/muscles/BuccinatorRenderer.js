// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class BuccinatorRenderer {
  static build(data, profile) {
    const intensity = data.pout || 0;
    if (intensity < 0.1) return G.group('buc_static', null, []);
    return G.group('buc_muscles', null, [
      G.path('buc_L', [{ type: 'move', x: -40, y: 0 }, { type: 'line', x: -20, y: 10 }], { stroke: 'rgba(50,20,10,0.1)', lineWidth: 2 * intensity }),
      G.path('buc_R', [{ type: 'move', x: 40, y: 0 }, { type: 'line', x: 20, y: 10 }], { stroke: 'rgba(50,20,10,0.1)', lineWidth: 2 * intensity })
    ]);
  }
}
