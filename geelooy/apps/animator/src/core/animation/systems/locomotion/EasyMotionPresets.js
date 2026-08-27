
// B"H

/**
 * @file EasyMotionPresets.js
 * @description
 * ============================================================================
 * CHAPTER: EASY MOTIONS FOR LIVING CHARACTERS
 * ============================================================================
 *
 * These are direct, readable motion presets.
 * They do not require complex event graphs.
 * Put `easyMotion: "wave"` on a character and the soul waves.
 *
 * The Awtsmoos creates motion from the inside outward.
 * Here the inner name becomes outer limbs.
 *
 * @class EasyMotionPresets
 */
export class EasyMotionPresets {
  /**
   * Base target.
   *
   * @returns {Object} Pose data.
   */
  static base() {
    return {
      hipL: 0,
      kneeL: 2,
      hipR: 0,
      kneeR: 2,
      bob: 0,
      armL: 0,
      elbowL: 18,
      armR: 0,
      elbowR: 18,
      torsoSway: 0,
      footRollL: 0,
      footRollR: 0
    };
  }

  /**
   * Idle breathing pose.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static idle(data, time) {
    const s = Math.sin(time * 0.002);
    return {
      ...this.base(),
      bob: s * 1.4,
      armL: -4 + s * 2,
      armR: 4 - s * 2,
      elbowL: 20,
      elbowR: 20,
      torsoSway: s * 1.5
    };
  }

  /**
   * Talking gesture pose.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static talk(data, time) {
    const intensity = data.vocalIntensity || 0.5;
    const s = Math.sin(time * 0.008);
    return {
      ...this.base(),
      bob: Math.abs(s) * 2,
      armL: -10 + (s * 8 * intensity),
      armR: 12 - (s * 8 * intensity),
      elbowL: 24 + intensity * 14,
      elbowR: 22 + intensity * 14,
      torsoSway: s * 2
    };
  }

  /**
   * Wave pose.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static wave(data, time) {
    const s = Math.sin(time * 0.012);
    return {
      ...this.base(),
      armL: -8,
      elbowL: 20,
      armR: -72 + s * 14,
      elbowR: -58 + s * 22,
      bob: Math.abs(s) * 2,
      torsoSway: s * 1.2
    };
  }

  /**
   * Pointing pose.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static point(data, time) {
    const s = Math.sin(time * 0.006);
    return {
      ...this.base(),
      armL: -6,
      elbowL: 24,
      armR: -42 + s * 3,
      elbowR: -20,
      torsoSway: 2,
      bob: s
    };
  }

  /**
   * Thinking pose.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static think(data, time) {
    const s = Math.sin(time * 0.003);
    data.headTilt = -8 + s * 1.5;
    return {
      ...this.base(),
      armL: -18,
      elbowL: 38,
      armR: 26,
      elbowR: -48,
      torsoSway: -1,
      bob: s * 0.8
    };
  }

  /**
   * Shrug pose.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static shrug(data, time) {
    const s = Math.sin(time * 0.005);
    data.shouldersYOffset = -9 + s * 2;
    return {
      ...this.base(),
      armL: 35,
      elbowL: 38,
      armR: -35,
      elbowR: -38,
      torsoSway: s * 2,
      bob: Math.abs(s) * 2
    };
  }

  /**
   * Bounce pose.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static bounce(data, time) {
    const s = Math.sin(time * 0.009);
    return {
      ...this.base(),
      bob: Math.abs(s) * 14,
      hipL: s * 8,
      hipR: -s * 8,
      kneeL: 12 + Math.abs(s) * 12,
      kneeR: 12 + Math.abs(s) * 12,
      armL: -s * 16,
      armR: s * 16,
      elbowL: 24,
      elbowR: 24,
      torsoSway: s * 4
    };
  }
}
