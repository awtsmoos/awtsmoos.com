
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class FrisbeeProp
 * @description
 * THE DISK OF LEVITATION (Tzalachat).
 * B"H
 * 
 * An isolated module drawing a soaring plastic disc.
 */
export class FrisbeeProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    
    return G.group(propData.id, transform, [
      G.ellipse('frisbee_outer', 0, 0, 40*s, 10*s, 0, { fill: propData.color || '#ff0055', stroke: '#000', lineWidth: 3*s }),
      G.ellipse('frisbee_inner', 0, 0, 25*s, 5*s, 0, { stroke: '#000', lineWidth: 2*s })
    ]);
  }
}
