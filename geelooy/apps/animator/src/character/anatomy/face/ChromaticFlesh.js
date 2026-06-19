
// B"H
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

/**
 * @file ChromaticFlesh.js
 * @brief THE RADIANCE OF THE SKIN (Or HaBasar).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 2: THE COLOR OF THE FEELING
 * ═══════════════════════════════════════════════════════════════
 * In highly exaggerated performances, the base skin color is but 
 * a canvas. This engine blends the skin tone with "Emotional Hues."
 * 
 * @class ChromaticFlesh
 */
export class ChromaticFlesh {
  /**
   * @function getTintedColor
   * @description Computes the final manifest skin hex code.
   */
  static getTintedColor(baseColor, data) {
    const intensity = data.exaggeration || 0;
    if (intensity <= 0) return baseColor;

    const { joy = 0, sadness = 0, anger = 0 } = data;
    
    let targetHue = baseColor;

    // ANGER: Flooding with Red
    if (anger > 0.6) {
      targetHue = AwtsmoosMath.lerpColor(baseColor, '#ff4d4d', (anger - 0.6) * 2 * intensity);
    }
    // SADNESS: Chilling with Blue/Pale
    else if (sadness > 0.6) {
      targetHue = AwtsmoosMath.lerpColor(baseColor, '#a0c4ff', (sadness - 0.6) * 2 * intensity);
    }
    // JOY: Glowing with Gold/Warmth
    else if (joy > 0.8) {
      targetHue = AwtsmoosMath.lerpColor(baseColor, '#fff9c4', (joy - 0.8) * 5 * intensity);
    }

    return targetHue;
  }
}
