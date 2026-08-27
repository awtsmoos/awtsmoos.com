// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class DepressorAnguliOrisRenderer {
  static build(data, profile) {
    const intensity = data.sadness || 0;
    if (intensity < 0.1) return G.group('dao_static', null, []);
    return G.group('dao_muscles', null, [
      G.path('dao_L', [{ type: 'move', x: -35, y: 5 }, { type: 'line', x: -40, y: 30 }], { stroke: 'rgba(0,0,0,0.03)', lineWidth: 3 * intensity }),
      G.path('dao_R', [{ type: 'move', x: 35, y: 5 }, { type: 'line', x: 40, y: 30 }], { stroke: 'rgba(0,0,0,0.03)', lineWidth: 3 * intensity })
    ]);
  }
}
