// B"H

/**
 * @file PerformanceLayerMixer.js
 * @description
 * Additive and override helpers for layered human motion.
 */
export class PerformanceLayerMixer {
  /**
   * Adds body values.
   *
   * @param {Object} pose - Pose.
   * @param {Object} values - Body values.
   * @param {number} amount - Blend amount.
   * @returns {void}
   */
  static addBody(pose, values = {}, amount = 1) {
    Object.entries(values).forEach(([key, value]) => {
      pose.body[key] = Number(pose.body[key] || 0) + Number(value || 0) * amount;
    });
  }

  /**
   * Replaces or blends a side arm.
   *
   * @param {Object} pose - Pose.
   * @param {string} side - left or right.
   * @param {Object} values - Arm values.
   * @param {number} amount - Blend.
   * @param {boolean} lock - Lock arm from lower-priority layers.
   * @returns {void}
   */
  static arm(pose, side, values = {}, amount = 1, lock = false) {
    const arm = pose.arms[side];
    if (!arm || arm.lock) return;

    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'number') {
        arm[key] = Number(arm[key] || 0) * (1 - amount) + value * amount;
      } else {
        arm[key] = value;
      }
    });

    if (lock) arm.lock = true;
  }

  /**
   * Blends a side leg.
   *
   * @param {Object} pose - Pose.
   * @param {string} side - left or right.
   * @param {Object} values - Leg values.
   * @param {number} amount - Blend.
   * @returns {void}
   */
  static leg(pose, side, values = {}, amount = 1) {
    const leg = pose.legs[side];
    if (!leg) return;

    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'number') {
        leg[key] = Number(leg[key] || 0) * (1 - amount) + value * amount;
      } else {
        leg[key] = value;
      }
    });
  }

  /**
   * Blends face values.
   *
   * @param {Object} pose - Pose.
   * @param {Object} values - Face values.
   * @param {number} amount - Blend.
   * @returns {void}
   */
  static face(pose, values = {}, amount = 1) {
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'number') {
        pose.face[key] = Number(pose.face[key] || 0) * (1 - amount) + value * amount;
      } else {
        pose.face[key] = value;
      }
    });
  }
}