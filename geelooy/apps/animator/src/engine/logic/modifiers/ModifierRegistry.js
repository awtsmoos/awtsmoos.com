
// B"H
import { ArrayModifier } from './types/ArrayModifier.js';
import { MirrorModifier } from './types/MirrorModifier.js';
import { PathDistortModifier } from './types/PathDistortModifier.js';

/**
 * @file ModifierRegistry.js
 * @brief THE REGISTRY OF TRANSFORMATION (Reshimu HaShinnuy).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 1: THE TOOLS OF THE SOFER
 * ═══════════════════════════════════════════════════════════════
 * The Awtsmoos spoke a single word, and light expanded. 
 * This registry allows a single JSON node to carry a "Stack" 
 * of modifiers that multiply and reshape its existence.
 * 
 * @class ModifierRegistry
 */
export const ModifierRegistry = {
  /** 
   * @description Maps the JSON 'type' to the class that executes the logic.
   */
  map: {
    'array':  ArrayModifier,
    'mirror': MirrorModifier,
    'distort': PathDistortModifier
  },

  /**
   * @function get
   * @description Retrieves the specialized modifier engine.
   */
  get(type) {
    return this.map[type] || null;
  }
};
