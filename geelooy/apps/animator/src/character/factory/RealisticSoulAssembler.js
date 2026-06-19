
// B"H
import { StableCharacterAssembler } from './stable/StableCharacterAssembler.js';

/**
 * @file RealisticSoulAssembler.js
 * @description
 * ============================================================================
 * CHAPTER: THE OLD BROKEN REALISTIC ROUTE IS SEALED
 * ============================================================================
 *
 * The old rich route was mixing incompatible coordinate systems. Until that
 * whole rig is rebuilt cleanly, this assembler delegates to the stable rig.
 */
export class RealisticSoulAssembler {
  /**
   * Assembles a realistic character through the stable body contract.
   *
   * @param {Object} data - Character data.
   * @returns {Object|null} VirtualGraph node.
   */
  static assemble(data) {
    return StableCharacterAssembler.assemble(data);
  }
}
