// B"H

/**
 * @file BodyProportions.js
 * @description
 * Character body variety without random disconnection.
 */
export class BodyProportions {
  /**
   * Gets body proportions.
   *
   * @param {string} profile - Profile id.
   * @returns {Object} Proportions.
   */
  static get(profile = 'friendlyAverage') {
    const map = {
      friendlyAverage: { head: 1, torso: 1, leg: 1, shoulder: 1, hip: 1, foot: 1 },
      expressiveLeader: { head: 1.02, torso: 1.02, leg: 1, shoulder: 1.08, hip: 1, foot: 1.04 },
      tallSlim: { head: 0.96, torso: 1.06, leg: 1.12, shoulder: 0.94, hip: 0.9, foot: 1.02 },
      alertCompact: { head: 1.04, torso: 0.96, leg: 0.94, shoulder: 0.96, hip: 0.94, foot: 1.08 },
      sage: { head: 1.06, torso: 1.08, leg: 0.92, shoulder: 1.05, hip: 1.05, foot: 1.02 }
    };

    return map[profile] || map.friendlyAverage;
  }
}