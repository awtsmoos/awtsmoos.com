// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class PlatysmaRenderer {
  static build(data, profile) {
    const intensity = data.stress || 0;
    if (intensity < 0.1) return G.group('pla_static', null, []);
    return G.group('pla_muscles', null, [
      G.path('pla_L', [{ type: 'move', x: -40, y: 60 }, { type: 'line', x: -30, y: 100 }], { stroke: 'rgba(0,0,0,0.02)', lineWidth: 10 * intensity }),
      G.path('pla_R', [{ type: 'move', x: 40, y: 60 }, { type: 'line', x: 30, y: 100 }], { stroke: 'rgba(0,0,0,0.02)', lineWidth: 10 * intensity })
    ]);
  }
}
