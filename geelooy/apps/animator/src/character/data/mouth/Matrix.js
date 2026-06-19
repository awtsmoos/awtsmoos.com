
/* B”H */
import { FRONT_MOUTHS } from './perspectives/FrontMouths.js';
import { SIDE_MOUTHS } from './perspectives/SideMouths.js';
import { THREE_QUARTER_MOUTHS } from './perspectives/ThreeQuarterMouths.js';

/**
 * @class MouthMatrix
 * @description
 * THE SIFRA DI-TZENIUTA (Book of Concealment).
 * Organizes the infinite expressions into an accessible grid based on perspective.
 */
export class MouthMatrix {
  static getSet(view) {
    if (view === 'side') return SIDE_MOUTHS;
    if (view === 'threeQuarter') return THREE_QUARTER_MOUTHS;
    return FRONT_MOUTHS;
  }
}
