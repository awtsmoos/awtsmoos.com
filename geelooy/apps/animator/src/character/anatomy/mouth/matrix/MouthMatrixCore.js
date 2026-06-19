
// B"H
import { FrontVisemes } from './FrontVisemes.js';
import { ThreeQuarterVisemes } from './ThreeQuarterVisemes.js';
import { SideVisemes } from './SideVisemes.js';

/**
 * @class MouthMatrixCore
 * @description
 * THE MATRIX OF EXPRESSION.
 * B"H
 * 
 * All paths must adhere identically to a rigid 5-point constraint system to 
 * allow perfect Bezier interpolation over time.
 */
export class MouthMatrixCore {
  static getVisemes(view) {
    // 3/4 and Side views physically shrink and shift to mirror the skull angle
    const dir = view === 'side' ? 1.4 : (view === 'threeQuarter' ? 1.25 : 1.0);
    
    // The Universal Construct
    // Produces [Start, Top Arc, Bottom Arc] compatible with our drawing loop
    const construct = (w, rightY, upBend, downBend) => [
      { type: 'move', x: -w, y: rightY === -10 ? rightY : 0 }, // Adjust left point for smirks natively
      { type: 'quad', cx: 0, cy: upBend, x: w * dir, y: rightY }, // The Upper Lip
      { type: 'quad', cx: 0, cy: downBend, x: -w, y: rightY === -10 ? rightY : 0 } // The Lower Lip
    ];

    if (view === 'side' || view === 'back') {
      return SideVisemes.get(construct, dir);
    } else if (view === 'threeQuarter') {
      return ThreeQuarterVisemes.get(construct, dir);
    } else {
      return FrontVisemes.get(construct);
    }
  }
}
