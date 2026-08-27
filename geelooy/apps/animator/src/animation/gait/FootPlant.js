// B"H
import { CycleMath } from '../math/CycleMath.js';

/**
 * @file FootPlant.js
 * @description
 * ============================================================================
 * CHAPTER: THE FOOT THAT LEARNED WHEN TO STAY ON THE GROUND
 * ============================================================================
 *
 * Walking is ruined when both feet slide forever. This module marks which part
 * of the cycle is planted and which part is swinging through the air.
 *
 * @class FootPlant
 */
export class FootPlant {
  /**
   * Samples plant and swing.
   *
   * @param {number} phase - Phase from 0 to 1.
   * @returns {Object} Foot plant data.
   */
  static sample(phase) {
    const p = CycleMath.wrap01(phase);
    const planted = p < 0.12 || p > 0.62;
    const swingRaw = planted ? 0 : (p - 0.12) / 0.5;
    const swing = CycleMath.smooth(swingRaw);
    const lift = planted ? 0 : Math.sin(swing * Math.PI);

    return {
      planted,
      swing,
      lift,
      contact: planted ? 1 : 0
    };
  }
}