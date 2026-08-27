
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file Joints.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 10: THE HINGES OF MIGHT (Pirkai HaGevurah)
 * ═══════════════════════════════════════════════════════════════
 * 
 * "And the joints of his thighs were loosened..." (Daniel 5:6)
 * If the joints are undefined, the arm ceases to exist. This pure 
 * data vessel provides the geometric `build` method required by the 
 * ArmAssembler to fuse the upper and lower segments together seamlessly.
 * 
 * @class JointGeometry
 */
export class JointGeometry {
  static build(id, x, y, radius, color = '#222') {
    return G.circle(id, x, y, radius, { 
        fill: color,
        stroke: '#000000',
        lineWidth: 3
    });
  }
}
