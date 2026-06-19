
// B"H
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @file BrowEmotionOverlay.js
 * @description
 * CHAPTER: THE EYEBROWS TELL THE TRUTH.
 *
 * This module adds subtle performance layers after the base emotion morphing.
 * It keeps brows active, expressive, and far more inviting.
 */
export class BrowEmotionOverlay {
  /**
   * Applies brow micro-expression overlays.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Real time.
   * @returns {void}
   */
  static apply(data, time) {
    const morph = data.morphParams || {};
    const speechFace = data.speechFace || {};

    const joy = data.joy || 0;
    const sadness = data.sadness || 0;
    const concentration = data.concentration || 0;
    const surprise = data.surprise || 0;
    const stress = data.stress || 0;
    const pulse = Math.sin((time * 0.009) + (speechFace.localPhase || 0)) * (speechFace.browRhythm || 0);

    const innerOffset =
      (surprise * 6.0) +
      ((speechFace.questionLift || 0) * 14.0) -
      (concentration * 5.0) -
      (stress * 5.0) +
      pulse;

    const outerOffset =
      (surprise * 5.5) +
      (joy * 3.0) -
      (sadness * 2.5) +
      ((speechFace.questionLift || 0) * 10.0);

    const angleOffset =
      ((speechFace.browPinch || 0) * 12.0) +
      (stress * 5.0) -
      ((speechFace.warmth || 0) * 4.0) -
      (joy * 2.0);

    morph.bi = AwtsmoosMath.clamp((morph.bi || 0) + innerOffset, -30, 18);
    morph.bo = AwtsmoosMath.clamp((morph.bo || 0) + outerOffset, -18, 18);
    morph.ba = AwtsmoosMath.clamp((morph.ba || 0) + angleOffset, -25, 18);
    morph.bx = AwtsmoosMath.clamp((morph.bx || 0) + (pulse * 0.4), -10, 10);
    morph.squint = AwtsmoosMath.clamp((morph.squint || 1) - ((speechFace.squintBias || 0) * 0.8), 0.72, 1.18);

    data.morphParams = morph;
  }
}
