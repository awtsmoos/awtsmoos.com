
// B"H
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';
import { CartoonExpressionPresets } from '../../../../character/face/CartoonExpressionPresets.js';

/**
 * @file ExpressionDirector.js
 * @description
 * ============================================================================
 * CHAPTER: THE FACE OPENS WITH MANY WINDOWS
 * ============================================================================
 *
 * Expressions now come from presets plus speech punctuation plus mood.
 * This gives variety while keeping the rich original face renderers.
 *
 * @class ExpressionDirector
 */
export class ExpressionDirector {
  /**
   * Applies expression targets.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {void}
   */
  static apply(data, time) {
    const preset = CartoonExpressionPresets.get(data.expression || data.mood || 'neutral');
    const phrase = String(data.speech || '');
    const question = phrase.includes('?') ? 1 : 0;
    const bang = phrase.includes('!') ? 1 : 0;
    const speech = data.vocalIntensity || 0;
    const phase = AwtsmoosMath.hashString(data.id || 'soul') * 0.001;
    const pulse = (Math.sin((time * 0.0014) + phase) + 1) * 0.5;

    const target = {
      joy: preset.joy + (speech * 0.05) + (pulse * 0.03),
      sadness: preset.sadness,
      concentration: preset.concentration + (question * 0.18),
      stress: preset.stress + (bang * 0.18),
      surprise: preset.surprise + (question * 0.06) + (bang * 0.14),
      hate: preset.hate
    };

    this.write(data, 'joy', target.joy, 0.18);
    this.write(data, 'sadness', target.sadness, 0.18);
    this.write(data, 'concentration', target.concentration, 0.20);
    this.write(data, 'stress', target.stress, 0.18);
    this.write(data, 'surprise', target.surprise, 0.16);
    this.write(data, 'hate', target.hate, 0.14);
  }

  /**
   * Smooth-writes one emotion value.
   *
   * @param {Object} data - Character data.
   * @param {string} key - Emotion key.
   * @param {number} value - Target value.
   * @param {number} friction - Smoothing.
   * @returns {void}
   */
  static write(data, key, value, friction) {
    const current = Number.isFinite(data[key]) ? data[key] : 0;
    const clamped = AwtsmoosMath.clamp(value, 0, 1);
    data[key] = AwtsmoosMath.lerp(current, clamped, friction);
  }
}
