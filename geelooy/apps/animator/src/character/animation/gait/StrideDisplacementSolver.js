// B"H

/**
 * @file StrideDisplacementSolver.js
 * @description
 * Chapter: The road stopped easing twice.
 * The director owns progress shaping. This solver only interpolates cleanly, so
 * a walking actor crosses the frame steadily instead of appearing frozen then
 * suddenly arriving at the end.
 */
export class StrideDisplacementSolver {
  /**
   * Samples travel between from/to.
   *
   * @param {Object} from - Start position.
   * @param {Object} to - End position.
   * @param {number} t - Progress 0..1.
   * @returns {Object} Position.
   */
  static sample(from = {}, to = {}, t = 0) {
    const p = Math.max(0, Math.min(1, Number(t) || 0));
    return {
      x: this.lerp(Number(from.x || 0), Number(to.x || 0), p),
      y: this.lerp(Number(from.y || 0), Number(to.y || 0), p),
      scale: this.lerp(Number(from.scale || to.scale || 0.9), Number(to.scale || from.scale || 0.9), p)
    };
  }

  /** @param {number} a @param {number} b @param {number} t @returns {number} */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }
}
