// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class LampLayerRenderer {
  static build(w, h) {
    const ground = h * 0.73;
    return G.group('lamp_layer', null, [0.31, 0.5, 0.69].map((u, i) => {
      const x = w * u;
      const top = ground - h * 0.13;
      return G.group(`lamp_${i}`, null, [
        G.path(`lamp_post_${i}`, [{ type: 'move', x, y: ground + 8 }, { type: 'line', x, y: top }], { stroke: '#687079', lineWidth: 5, lineCap: 'round' }),
        G.circle(`lamp_glow_${i}`, x, top, 22, { fill: 'rgba(255,80,72,0.16)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 }),
        G.circle(`lamp_head_${i}`, x, top, 9, { fill: '#ff514d', stroke: '#742120', lineWidth: 2 })
      ]);
    }));
  }
}