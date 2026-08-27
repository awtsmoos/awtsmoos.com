
// B"H
import { StableCharacterAssembler } from '../stable/StableCharacterAssembler.js';

/**
 * @file CompactHumanAssembler.js
 * @description
 * ============================================================================
 * CHAPTER: THE BROKEN COMPACT HUMAN IS RETIRED
 * ============================================================================
 *
 * The compact route produced stacked torso blocks, drifting hands, and warped
 * faces. It now delegates to the stable rig.
 */
export class CompactHumanAssembler {
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
