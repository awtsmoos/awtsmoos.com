
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @class DepthOrder
 * @description
 * THE RANKING OF EMANATION.
 * B"H
 */
export class DepthOrder {
  static resolve(side, profile, segments) {
    const ordered = [
       segments.shoulder,
       segments.upper,
       segments.elbow,
       segments.lower,
       segments.hand
    ];
    
    return G.group(`arm_depth_final_${side}`, null, ordered);
  }
}
