
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class SwordProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    
    return G.group(propData.id, transform, [
      G.rect('blade', -4*s, -100*s, 8*s, 100*s, { fill: '#ecf0f1', stroke: '#2c3e50', lineWidth: 2*s }),
      G.rect('hilt', -15*s, 0, 30*s, 6*s, { fill: '#f1c40f', stroke: '#000', lineWidth: 2*s }),
      G.rect('handle', -3*s, 6*s, 6*s, 25*s, { fill: propData.color || '#8e44ad', stroke: '#000', lineWidth: 2*s })
    ]);
  }
}
