
// B"H

/**
 * @file CameraTransitionSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE CAMERA THAT MOVED WITHOUT TEARING THE WORLD
 * ============================================================================
 *
 * Cuts, fades, dolly moves, and smooth tracking all need transition math. This
 * solver blends current and target camera values with a controllable amount.
 *
 * @module CameraTransitionSolver
 */

/**
 * @class CameraTransitionSolver
 * @description
 * Smooths camera movement.
 */
export class CameraTransitionSolver {
  /**
   * Blends two camera states.
   *
   * @param {Object} current - Current camera.
   * @param {Object} target - Target camera.
   * @param {number} amount - Blend amount.
   * @returns {Object} Blended camera.
   */
  static smooth(current = {}, target = {}, amount = 0.08) {
    const a = Math.max(0, Math.min(1, amount));
    return {
      ...target,
      x: this.lerp(current.x ?? 0, target.x ?? 0, a),
      y: this.lerp(current.y ?? -118, target.y ?? -118, a),
      zoom: this.lerp(current.zoom ?? 0.62, target.zoom ?? 0.62, a),
      rotation: this.lerp(current.rotation ?? 0, target.rotation ?? 0, a)
    };
  }

  /**
   * Linear interpolation.
   *
   * @param {number} from - Start.
   * @param {number} to - End.
   * @param {number} amount - Blend.
   * @returns {number} Interpolated number.
   */
  static lerp(from, to, amount) {
    return from + (to - from) * amount;
  }
}
