// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file KneeVessel.js
 */
export class KneeVessel {
  static build(side, kneeX, kneeY) {
    return G.ellipse(`knee_${side}`, kneeX, kneeY, 6, 6, 0, { fill: 'rgba(0,0,0,0.1)' });
  }
}
