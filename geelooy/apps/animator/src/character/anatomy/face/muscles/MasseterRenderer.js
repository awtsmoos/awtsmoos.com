// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class MasseterRenderer {
  static build(data, profile) {
    const intensity = data.tension || 0;
    if (intensity < 0.1) return G.group('mas_static', null, []);
    return G.group('mas_muscles', null, [
      G.path('mas_L', [{ type: 'move', x: -45, y: 10 }, { type: 'line', x: -40, y: 40 }], { stroke: 'rgba(0,0,0,0.03)', lineWidth: 5 * intensity }),
      G.path('mas_R', [{ type: 'move', x: 45, y: 10 }, { type: 'line', x: 40, y: 40 }], { stroke: 'rgba(0,0,0,0.03)', lineWidth: 5 * intensity })
    ]);
  }
}
