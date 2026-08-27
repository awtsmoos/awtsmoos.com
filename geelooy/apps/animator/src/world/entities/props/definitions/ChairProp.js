
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class ChairProp
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 33: THE SEAT OF JUDGMENT (Kise HaDin)
 * ═══════════════════════════════════════════════════════════════
 */
export class ChairProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    const w = 60 * s;
    const h = 80 * s;
    const color = propData.color || '#4a2b10';

    return G.group(propData.id, transform, [
      G.rect('backrest_base', -w/2, -h, w, h/2, { fill: color, stroke: '#000', lineWidth: 3*s }),
      G.rect('seat', -w/2, -h/2, w, 10*s, { fill: color, stroke: '#000', lineWidth: 3*s }),
      G.rect('leg_L', -w/2, -h/2 + 10*s, 6*s, h/2, { fill: '#222', stroke: '#000', lineWidth: 2*s }),
      G.rect('leg_R', w/2 - 6*s, -h/2 + 10*s, 6*s, h/2, { fill: '#222', stroke: '#000', lineWidth: 2*s })
    ]);
  }
}
