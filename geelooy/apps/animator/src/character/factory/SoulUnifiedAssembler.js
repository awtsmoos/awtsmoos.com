
// B"H
import { RealisticSoulAssembler } from './RealisticSoulAssembler.js';
import { IllustratedSoulAssembler } from './IllustratedSoulAssembler.js';
import { VisualDebugLog } from './diagnostics/VisualDebugLog.js';

/**
 * @file SoulUnifiedAssembler.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE ROUTER RETURNS TO THE ORIGINAL SOULS
 * ═══════════════════════════════════════════════════════════════
 *
 * The compact replacement butchered the characters by throwing away the rich
 * original render systems: hair factories, face systems, robe systems, beard
 * systems, blink logic, mouth logic, and the anatomy modules already present
 * in the project. This file restores the original route:
 *
 * - illustrated_sage goes to IllustratedSoulAssembler
 * - everything else goes to RealisticSoulAssembler
 *
 * The Awtsmoos creates the soul and its garments with exact letters. A router
 * must not erase the garment and call the skeleton fixed. The route returns
 * to the richer vessels, while the actual bug is fixed where it belongs: in
 * the neck span and missing illustrated legs.
 *
 * @class SoulUnifiedAssembler
 */
export class SoulUnifiedAssembler {
  /**
   * Routes character data into the correct rich assembler.
   *
   * @param {Object} data - Processed character state.
   * @returns {Object|null} VirtualGraph node.
   */
  static assemble(data) {
    if (!data) return null;

    if (data.style === 'illustrated_sage') {
      VisualDebugLog.every(`route-${data.id}`, 120, `route id=${data.id} style=illustrated_sage target=IllustratedSoulAssembler`);
      return IllustratedSoulAssembler.assemble(data);
    }

    VisualDebugLog.every(`route-${data.id}`, 120, `route id=${data.id} style=${data.style || 'realistic'} target=RealisticSoulAssembler`);
    return RealisticSoulAssembler.assemble(data);
  }
}
