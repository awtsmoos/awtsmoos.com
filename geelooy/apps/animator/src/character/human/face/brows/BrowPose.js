
// B"H

/**
 * @file BrowPose.js
 * @description Detailed brow channels for living expression.
 */

export class BrowPose {
  /**
   * Creates a neutral brow pose.
   *
   * @returns {Object} Neutral brow pose.
   */
  static neutral() {
    return {
      left: { innerLift: 0, outerLift: 0, arch: 0.1, tilt: 0, squeeze: 0, thickness: 1, curve: 0.3, xOffset: 0, yOffset: 0 },
      right: { innerLift: 0, outerLift: 0, arch: 0.1, tilt: 0, squeeze: 0, thickness: 1, curve: 0.3, xOffset: 0, yOffset: 0 },
      center: { pinch: 0, compression: 0, verticalFold: 0, wrinkleIntensity: 0 },
      global: { asymmetry: 0, tremble: 0, settle: 1, intensity: 1 }
    };
  }

  /**
   * Blends a layer into a base brow pose.
   *
   * @param {Object} base - Base pose.
   * @param {Object} layer - Layer pose.
   * @param {number} weight - Blend weight.
   * @returns {Object} Blended pose.
   */
  static blend(base = {}, layer = {}, weight = 1) {
    const out = JSON.parse(JSON.stringify({ ...this.neutral(), ...base }));
    return this.deepBlend(out, layer, Math.max(0, Math.min(1, weight)));
  }

  /**
   * Deep blends numeric pose channels.
   *
   * @param {Object} out - Output object.
   * @param {Object} layer - Layer object.
   * @param {number} weight - Weight.
   * @returns {Object} Output.
   */
  static deepBlend(out, layer, weight) {
    for (const [key, value] of Object.entries(layer || {})) {
      if (typeof value === 'number') {
        out[key] = typeof out[key] === 'number' ? out[key] * (1 - weight) + value * weight : value;
      } else if (value && typeof value === 'object') {
        out[key] = this.deepBlend(out[key] || {}, value, weight);
      }
    }
    return out;
  }
}
