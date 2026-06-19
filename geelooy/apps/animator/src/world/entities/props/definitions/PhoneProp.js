
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class PhoneProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    
    return G.group(propData.id, transform, [
      G.rect('phone_body', -10*s, -25*s, 20*s, 35*s, { fill: propData.color || '#222', stroke: '#000', lineWidth: 3*s, radius: 4*s }),
      G.rect('phone_screen', -8*s, -22*s, 16*s, 28*s, { fill: '#00ffcc' })
    ]);
  }
}
