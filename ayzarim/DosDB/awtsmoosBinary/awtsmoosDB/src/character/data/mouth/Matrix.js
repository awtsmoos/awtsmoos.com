
/* B”H */
import { FRONT_MATRIX } from './perspectives/FrontMatrix.js';
import { SIDE_MATRIX } from './perspectives/SideMatrix.js';
import { THREE_QUARTER_MATRIX } from './perspectives/ThreeQuarterMatrix.js';

/**
 * @class MouthMatrix
 * @description
 * THE SIFRA DI-TZENIUTA (Book of Concealment).
 * Organizes the infinite expressions into an accessible grid based on perspective.
 * Now routing to the profoundly shattered and highly-organized sub-matrices.
 */
export class MouthMatrix {
  static getSet(view) {
    if (view === 'side') return SIDE_MATRIX;
    if (view === 'threeQuarter') return THREE_QUARTER_MATRIX;
    return FRONT_MATRIX;
  }
}
