
import { OpenMouths3Q } from '../shapes/threeQuarter/OpenMouths3Q.js';
import { ClosedMouths3Q } from '../shapes/threeQuarter/ClosedMouths3Q.js';

/**
 * @file ThreeQuarterVisemes.js
 * @description
 * THE ZAIR ANPIN MATRIX.
 * B"H
 */
export class ThreeQuarterVisemes {
  static get(construct) {
    return {
      ...OpenMouths3Q.get(construct),
      ...ClosedMouths3Q.get(construct)
    };
  }
}
