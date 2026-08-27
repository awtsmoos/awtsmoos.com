
// B"H
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @file MouthEmotionOverlay.js
 * @description
 * CHAPTER: THE MOUTH BECOMES INVITING.
 *
 * This module deepens speech realism by combining the viseme stream with
 * emotional warmth, cheek life, grimace, and mouth-width modulation.
 */
export class MouthEmotionOverlay {
  /**
   * Applies mouth performance overlays.
   *
   * @param {Object} data - Character data.
   * @returns {void}
   */
  static apply(data) {
    const morph = data.morphParams || {};
    const speechFace = data.speechFace || {};

    const joy = data.joy || 0;
    const sadness = data.sadness || 0;
    const stress = data.stress || 0;
    const vocal = data.vocalIntensity || 0;

    const targetOpen = speechFace.mouthOpen || (vocal * 0.45);
    const targetWidth = speechFace.mouthWidth || (26 + vocal * 6);
    const targetSmile = (speechFace.smileBias || 0) + (joy * 0.24);
    const targetGrimace = (speechFace.grimaceBias || 0) + (stress * 0.20);
    const targetCheek = (speechFace.cheekLift || 0) + (joy * 1.8);
    const targetFrown = sadness * 0.22;

    data.mouthOpen = AwtsmoosMath.clamp(
      AwtsmoosMath.lerp(data.mouthOpen || 0, targetOpen, 0.35),
      0,
      1.35
    );

    data.mouthWidth = AwtsmoosMath.lerp(
      data.mouthWidth || 26,
      targetWidth + (joy * 4) - (sadness * 2),
      0.28
    );

    morph.mouthSmile = AwtsmoosMath.clamp((morph.mouthSmile || 0) + targetSmile, 0, 1.40);
    morph.mouthFrown = AwtsmoosMath.clamp((morph.mouthFrown || 0) + targetFrown, 0, 1.20);
    morph.mouthGrimace = AwtsmoosMath.clamp((morph.mouthGrimace || 0) + targetGrimace, 0, 1.20);
    morph.cheek = AwtsmoosMath.clamp((morph.cheek || 0) + targetCheek, 0, 10);
    morph.squint = AwtsmoosMath.clamp((morph.squint || 1) - ((speechFace.squintBias || 0) * 0.25), 0.72, 1.18);

    data.morphParams = morph;
  }
}
