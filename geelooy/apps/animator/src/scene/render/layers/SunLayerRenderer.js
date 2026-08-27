// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class SunLayerRenderer {
  static build(w, h) {
    const x = w * 0.82;
    const y = h * 0.22;
    return G.group('sun_layer', null, [
      G.circle('sun_glow_a', x, y, 54, { fill: 'rgba(255,230,120,0.16)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 }),
      G.circle('sun_glow_b', x, y, 38, { fill: 'rgba(255,230,120,0.2)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 }),
      G.circle('sun_core', x, y, 22, { fill: '#ffe27a', stroke: '#ffe27a', lineWidth: 1 })
    ]);
  }
}