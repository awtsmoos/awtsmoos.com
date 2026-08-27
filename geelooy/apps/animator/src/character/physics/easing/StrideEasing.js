
// B"H
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

/**
 * @file StrideEasing.js
 * @description
 * CHAPTER: THE SOFTENING OF THE STEP
 *
 * The planted foot drags with gravity.
 * The lifted foot returns with grace.
 * The curve is small, modular, and pure.
 */
export class StrideEasing {
  /**
   * Quadratic ease-out.
   *
   * @param {number} t - 0..1 input.
   * @returns {number} Eased result.
   */
  static easeOutQuad(t) {
    return AwtsmoosMath.Easing.easeOutQuad(t);
  }

  /**
   * Sine ease-in-out.
   *
   * @param {number} t - 0..1 input.
   * @returns {number} Eased result.
   */
  static easeInOutSine(t) {
    return AwtsmoosMath.Easing.easeInOutSine(t);
  }

  /**
   * Back ease-out.
   *
   * @param {number} t - 0..1 input.
   * @returns {number} Eased result.
   */
  static easeOutBack(t) {
    return AwtsmoosMath.Easing.easeOutBack(t);
  }
}
