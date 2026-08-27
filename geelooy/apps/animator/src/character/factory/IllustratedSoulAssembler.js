
// B"H
import { StableCharacterAssembler } from './stable/StableCharacterAssembler.js';

/**
 * @file IllustratedSoulAssembler.js
 * @description
 * ============================================================================
 * CHAPTER: THE OLD SAGE ROUTE IS SEALED
 * ============================================================================
 *
 * The old illustrated route could lose legs, stretch necks, and corrupt layer
 * order. This delegates to the stable rig so the sage stays whole.
 */
export class IllustratedSoulAssembler {
  /**
   * Assembles an illustrated sage through the stable body contract.
   *
   * @param {Object} data - Character data.
   * @returns {Object|null} VirtualGraph node.
   */
  static assemble(data) {
    return StableCharacterAssembler.assemble(data);
  }
}
