// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class OrbicularisOculiRenderer {
  static build(data, profile) {
    const intensity = data.squint || 0;
    if (intensity < 0.1) return G.group('oo_static', null, []);
    return G.group('oo_muscles', null, [
      G.path('oo_L', [{ type: 'move', x: -30, y: -50 }, { type: 'bezier', c1x: -40, c1y: -45, c2x: -20, c2y: -45, x: -10, y: -50 }], { stroke: 'rgba(0,0,0,0.1)', lineWidth: 1 * intensity }),
      G.path('oo_R', [{ type: 'move', x: 30, y: -50 }, { type: 'bezier', c1x: 40, c1y: -45, c2x: 20, c2y: -45, x: 10, y: -50 }], { stroke: 'rgba(0,0,0,0.1)', lineWidth: 1 * intensity })
    ]);
  }
}
