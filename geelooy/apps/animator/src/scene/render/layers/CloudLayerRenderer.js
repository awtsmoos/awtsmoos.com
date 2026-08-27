// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class CloudLayerRenderer {
  static build(w, h, time = 0) {
    const drift = (time * 0.004) % (w * 0.28);
    return G.group('cloud_layer', null, [
      this.cloud('cloud_a', w * 0.16 + drift, h * 0.23, 62),
      this.cloud('cloud_b', w * 0.52 + drift * 0.6, h * 0.18, 86),
      this.cloud('cloud_c', w * 0.91 - drift * 0.45, h * 0.27, 58)
    ]);
  }

  static cloud(id, x, y, s) {
    return G.group(id, null, [
      G.ellipse(`${id}_a`, x - s * 0.52, y, s * 0.58, s * 0.2, 0, { fill: 'rgba(255,255,255,0.36)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 }),
      G.ellipse(`${id}_b`, x, y - s * 0.08, s * 0.76, s * 0.25, 0, { fill: 'rgba(255,255,255,0.52)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 }),
      G.ellipse(`${id}_c`, x + s * 0.52, y, s * 0.52, s * 0.18, 0, { fill: 'rgba(255,255,255,0.32)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 })
    ]);
  }
}