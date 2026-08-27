
// B"H
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @file FallbackWalkCycle.js
 * @description
 * CHAPTER: THE MERCY OF CONTINUATION
 *
 * If advanced locomotion ever fails,
 * the scene must not die.
 * The feet keep walking.
 * The world keeps breathing.
 */
export class FallbackWalkCycle {
  /**
   * Produces a safe simple walk cycle.
   *
   * @param {number} time - Walk clock.
   * @param {Object} data - Character data.
   * @returns {Object} Walk target values.
   */
  static calculate(time, data = {}) {
    const speed = 0.005;
    const cycle = (time * speed) % AwtsmoosMath.TAU;
    const sin = Math.sin(cycle);

    const stride = 26 + ((data.joy || 0) * 8) + ((data.anger || 0) * 6);
    const knee = 24 + Math.abs(sin) * 36;
    const hip = sin * stride;

    return {
      hipL: hip,
      kneeL: knee,
      hipR: -hip,
      kneeR: 24 + Math.abs(Math.sin(cycle + Math.PI)) * 36,
      armL: -sin * 24,
      elbowL: 18 + Math.abs(sin) * 14,
      armR: sin * 24,
      elbowR: 18 + Math.abs(sin) * 14,
      bob: Math.abs(Math.sin(cycle * 2)) * 6,
      torsoSway: sin * 2,
      footRollL: sin * 2,
      footRollR: -sin * 2
    };
  }
}
