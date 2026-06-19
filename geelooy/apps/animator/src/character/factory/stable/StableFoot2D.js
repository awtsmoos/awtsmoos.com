// B"H
import { FootRenderer } from './limbs/FootRenderer.js';

/**
 * @file StableFoot2D.js
 * @description
 * Compatibility wrapper so old active imports use the smaller foot renderer.
 */
export class StableFoot2D {
  /**
   * Builds foot.
   *
   * @param {Object} spec - Spec.
   * @returns {Object} Node.
   */
  static build(spec) {
    return FootRenderer.build(spec);
  }
}