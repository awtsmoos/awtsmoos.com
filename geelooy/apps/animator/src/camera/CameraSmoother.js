// B"H

/**
 * @file CameraSmoother.js
 * @description
 * Tiny file that owns calm camera interpolation.
 */
export class CameraSmoother {
  /**
   * Smooths camera.
   *
   * @param {Object} current - Current camera.
   * @param {Object} target - Target camera.
   * @param {number} amount - Smooth amount.
   * @returns {Object} Camera.
   */
  static smooth(current = {}, target = {}, amount = 0.05) {
    return {
      x: this.lerp(current.x ?? 0, target.x ?? 0, amount),
      y: this.lerp(current.y ?? -118, target.y ?? -118, amount),
      zoom: this.lerp(current.zoom ?? 0.62, target.zoom ?? 0.62, amount)
    };
  }

  /**
   * Linear interpolation.
   *
   * @param {number} a - Start.
   * @param {number} b - End.
   * @param {number} t - Amount.
   * @returns {number} Value.
   */
  static lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }
}