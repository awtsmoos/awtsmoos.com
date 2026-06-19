
// B"H
/**
 * @file ShotFraming.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 3: THE LEVEL OF THE EYE (Gova HaEin)
 * ═══════════════════════════════════════════════════════════════
 */
import { ShotLexicon } from '../../../core/renderer/camera/data/ShotLexicon.js';

export class ShotFraming {
  /**
   * @function getCenterY
   * @description Calculates the Y anchor point for a specific shot type.
   * @param {Object} bounds - The character AABB.
   * @param {string} shotType - 'closeup', 'midshot', etc.
   * @returns {number} The target Y coordinate.
   */
  static getCenterY(bounds, shotType) {
    const shot = ShotLexicon[shotType] || ShotLexicon.midshot;
    
    // maxY is ground (0), minY is top of head (-450). Span is 450.
    const span = bounds.maxY - bounds.minY;
    
    // shot.yOffset is the height from the bottom where we center (0.0 to 1.0)
    // Closeup is usually around 0.8 (Upper Face)
    return bounds.maxY - (span * shot.yOffset);
  }
}
