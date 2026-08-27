
// B"H
import { StableCharacterAssembler } from '../stable/StableCharacterAssembler.js';

/**
 * @file CompactSageAssembler.js
 * @description
 * ============================================================================
 * CHAPTER: THE BROKEN COMPACT SAGE IS RETIRED
 * ============================================================================
 *
 * No more missing legs, beard-eaten body, or disconnected puppet limbs.
 */
export class CompactSageAssembler {
  /**
   * Assembles through the stable character renderer.
   *
   * @param {Object} data - Character data.
   * @returns {Object|null} VirtualGraph node.
   */
  static assemble(data) {
    return StableCharacterAssembler.assemble(data);
  }
}
