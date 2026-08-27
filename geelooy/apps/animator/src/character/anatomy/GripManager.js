
/* B”H */

/**
 * @class GripManager
 * @description
 * The 'Gevurah' (Strength/Restriction). 
 * Controls how the fingers clench to hold physical objects.
 * Fingers have 3 states: 'open' (Chesed), 'relaxed' (Tiferet), 'fist' (Gevurah).
 */
export class GripManager {
  /**
   * Calculates finger curl angles based on action.
   * @param {string} action - 'hold', 'wave', 'point', 'relax'
   */
  static getFingerCurls(action) {
    if (action === 'hold' || action === 'fist') {
      return [1.4, 1.4, 1.4]; // Tight curl for all 3 joints
    }
    if (action === 'wave') {
      return [-0.1, -0.1, -0.1]; // Spread wide
    }
    return [0.2, 0.2, 0.2]; // Natural slight curve
  }
}
