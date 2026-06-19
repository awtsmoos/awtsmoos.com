
// B"H
import { Atmosphere } from '../../../../world/Atmosphere.js';

/**
 * @file OverlayPhase.js
 * @brief THE VEIL OF THE HEAVENS (Masach HaShamayim).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 6: THE DIRECT MANIFESTATION
 * ═══════════════════════════════════════════════════════════════
 * Certain effects (like 10,000 drops of rain) bypass the JSON 
 * VirtualGraph hierarchy for extreme performance, drawing directly 
 * to the physical canvas. This phase executes those weather overlays.
 * 
 * @class OverlayPhase
 */
export class OverlayPhase {
  /**
   * @function apply
   * @description Draws atmospheric weather directly over the completed scene.
   * @param {Object} sceneData - The environment variables.
   * @param {Object} sequence - The active timeline sequence.
   * @param {Object} ctx - The canvas wrapper.
   * @param {number} realTime - Absolute clock.
   */
  static apply(sceneData, sequence, ctx, realTime) {
    const isRaining = sceneData?.weather === 'rain' || sequence?.scene?.weather === 'rain';
    
    if (isRaining) {
      Atmosphere.drawRain(ctx.ctx, ctx.width, ctx.height, realTime);
    }
  }
}
