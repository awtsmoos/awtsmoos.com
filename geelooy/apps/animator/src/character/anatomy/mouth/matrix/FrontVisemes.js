
// B"H
import { OpenMouthsFront } from '../shapes/front/OpenMouths.js';
import { ClosedMouthsFront } from '../shapes/front/ClosedMouths.js';

/**
 * @file FrontVisemes.js
 * @description
 * THE PANIM MATRIX.
 * B"H
 * Unifies the highly modularized Open and Closed shapes for the Front perspective.
 */
export class FrontVisemes {
  static get(construct) {
    return {
      ...OpenMouthsFront.get(construct),
      ...ClosedMouthsFront.get(construct)
    };
  }
}
