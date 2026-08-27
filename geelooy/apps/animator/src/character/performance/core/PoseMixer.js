
// B"H

/**
 * @file PoseMixer.js
 * @description
 * ============================================================================
 * CHAPTER: THE PEACE BETWEEN WALKING, TALKING, WAVING, AND SMILING
 * ============================================================================
 *
 * The body should not be conquered by one action. Feet may walk while mouth
 * speaks, one hand waves, the eyes look, and the brows reveal emotion. This
 * mixer blends nested pose data with weights instead of overwriting reality.
 *
 * @module PoseMixer
 */

/**
 * @class PoseMixer
 * @description
 * Blends pose objects recursively.
 */
export class PoseMixer {
  /**
   * Blends two pose trees.
   *
   * @param {Object} base - Base pose.
   * @param {Object} layer - Layer pose.
   * @param {number} weight - Blend weight from 0 to 1.
   * @returns {Object} Blended pose.
   */
  static blend(base = {}, layer = {}, weight = 1) {
    const w = Math.max(0, Math.min(1, Number(weight)));
    const out = { ...base };

    for (const [key, value] of Object.entries(layer || {})) {
      const current = out[key];

      if (typeof value === 'number') {
        out[key] = typeof current === 'number' ? current * (1 - w) + value * w : value;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        out[key] = this.blend(current && typeof current === 'object' ? current : {}, value, w);
      } else if (w >= 0.5) {
        out[key] = value;
      }
    }

    return out;
  }

  /**
   * Applies many weighted layers.
   *
   * @param {Object} base - Base pose.
   * @param {Array<Object>} layers - Layer entries with pose and weight.
   * @returns {Object} Final pose.
   */
  static stack(base = {}, layers = []) {
    let pose = { ...base };
    for (const layer of layers) {
      pose = this.blend(pose, layer.pose || {}, layer.weight ?? 1);
    }
    return pose;
  }
}
