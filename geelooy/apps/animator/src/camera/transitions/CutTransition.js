// B"H

/**
 * @file CutTransition.js
 * @description
 * Instant cinematic cut.
 */
export class CutTransition {
  /**
   * Samples transition.
   *
   * @param {Object} from - From camera.
   * @param {Object} to - To camera.
   * @returns {Object} Camera.
   */
  static sample(from, to) {
    return { ...to, fade: 0 };
  }
}