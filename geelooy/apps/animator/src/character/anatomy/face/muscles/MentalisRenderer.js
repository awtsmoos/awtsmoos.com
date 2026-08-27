// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class MentalisRenderer {
  static build(data, profile) {
    const intensity = data.sadness || 0;
    if (intensity < 0.1) return G.group('men_static', null, []);
    return G.group('men_muscles', null, [
      G.path('men_center', [{ type: 'move', x: -5, y: 50 }, { type: 'bezier', c1x: 0, c1y: 45, c2x: 0, c2y: 55, x: 5, y: 50 }], { stroke: 'rgba(0,0,0,0.05)', lineWidth: 3 * intensity })
    ]);
  }
}
