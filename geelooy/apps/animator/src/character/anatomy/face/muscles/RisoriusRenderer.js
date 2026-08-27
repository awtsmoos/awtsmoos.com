// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class RisoriusRenderer {
  static build(data, profile) {
    const intensity = data.smile || 0;
    if (intensity < 0.1) return G.group('ris_static', null, []);
    return G.group('ris_muscles', null, [
      G.path('ris_L', [{ type: 'move', x: -10, y: 5 }, { type: 'line', x: -50, y: 5 }], { stroke: 'rgba(50,20,10,0.02)', lineWidth: 2 * intensity }),
      G.path('ris_R', [{ type: 'move', x: 10, y: 5 }, { type: 'line', x: 50, y: 5 }], { stroke: 'rgba(50,20,10,0.02)', lineWidth: 2 * intensity })
    ]);
  }
}
