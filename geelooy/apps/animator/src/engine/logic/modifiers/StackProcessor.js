
// B"H
import { ModifierRegistry } from './ModifierRegistry.js';

/**
 * @file StackProcessor.js
 * @brief THE RECURSIVE ACTUALIZATION (L’shon HaMa’aseh).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 4: THE LAYERING OF COMMANDS
 * ═══════════════════════════════════════════════════════════════
 * A decree may have many conditions. This class takes a list 
 * of modifiers from the JSON and runs them like a factory line.
 * It takes a single node and may return an array of 500 nodes.
 * 
 * @class StackProcessor
 */
export class StackProcessor {
  /**
   * @function process
   * @description Recursively applies a stack of modifiers to a node list.
   * @param {Object|Array} input - A single node or array of nodes.
   * @param {Array<Object>} modifiers - The JSON stack of commands.
   * @returns {Array<Object>} The final manifest nodes.
   */
  static process(input, modifiers) {
    if (!modifiers || modifiers.length === 0) {
      return Array.isArray(input) ? input : [input];
    }

    let currentNodes = Array.isArray(input) ? input : [input];

    modifiers.forEach(modConfig => {
      const engine = ModifierRegistry.get(modConfig.type);
      if (!engine) return;

      let nextBatch = [];
      currentNodes.forEach(node => {
        const result = engine.apply(node, modConfig.params || {});
        if (Array.isArray(result)) {
          nextBatch = nextBatch.concat(result);
        } else {
          nextBatch.push(result);
        }
      });
      currentNodes = nextBatch;
    });

    return currentNodes;
  }
}
