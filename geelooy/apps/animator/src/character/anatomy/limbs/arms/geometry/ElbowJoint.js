// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @class ElbowJoint
 * @description
 * THE HINGE OF THE SOUL.
 * B"H
 */
export class ElbowJoint {
  static build(side, x, y, color = 'rgba(0,0,0,0.05)') {
    return G.circle(`elbow_joint_${side}`, x, y, 9, { 
        fill: color,
        stroke: 'rgba(0,0,0,0.1)',
        lineWidth: 1
    });
  }
}
