
import { OpenMouthsSide } from '../shapes/side/OpenMouthsSide.js';
import { ClosedMouthsSide } from '../shapes/side/ClosedMouthsSide.js';

/**
 * @file SideVisemes.js
 * @description
 * THE ACHORAIM MATRIX.
 * B"H
 */
export class SideVisemes {
  static get(construct) {
    return {
      ...OpenMouthsSide.get(construct),
      ...ClosedMouthsSide.get(construct)
    };
  }
}
