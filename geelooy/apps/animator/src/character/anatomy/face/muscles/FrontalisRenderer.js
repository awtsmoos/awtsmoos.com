// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class FrontalisRenderer {
  static build(data, profile) {
    const intensity = data.surprise || 0;
    if (intensity < 0.1) return G.group('fro_static', null, []);
    return G.group('fro_muscles', null, [
      G.path('fro_lines', [
          { type: 'move', x: -30, y: -80 }, { type: 'line', x: 30, y: -80 },
          { type: 'move', x: -25, y: -85 }, { type: 'line', x: 25, y: -85 }
      ], { stroke: 'rgba(0,0,0,0.04)', lineWidth: 1.5 * intensity })
    ]);
  }
}
