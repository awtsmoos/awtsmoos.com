
// B"H
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @file PupilAutonomicSystem.js
 * @description
 * THE WINDOWS OF DILATION (Hitrachvut HaIshon).
 * B"H
 * 
 * Pupils do not merely track light; they track the soul's intensity.
 * Fear and surprise cause massive dilation to absorb information.
 * Hate and anger cause microscopic contraction to focus the ray of Din (Judgment).
 */
export class PupilAutonomicSystem {
  /**
   * @function calculateRadius
   * @description Computes the dynamic scale of the pupil based on emotions.
   * @param {Object} data - Character state.
   * @param {number} baseRadius - The anatomical default radius.
   * @param {number} time - Global time for micro-pulsation.
   * @returns {number} The final physical radius of the pupil.
   */
  static calculateRadius(data, baseRadius, time) {
    const surprise = data.surprise || 0;
    const fear = data.fear || 0;
    const hate = data.hate || 0;
    const anger = data.anger || data.stress || 0;
    
    // Dilation (Chesed - Expansion)
    const dilation = (surprise * 0.5) + (fear * 0.3);
    
    // Contraction (Gevurah - Restriction)
    const contraction = (hate * 0.6) + (anger * 0.3);
    
    // Net change multiplier
    let multiplier = 1.0 + dilation - contraction;
    
    // Clamp to biological extremes
    multiplier = Math.max(0.3, Math.min(2.0, multiplier));
    
    // Hippus (Pupillary unrest): The constant, microscopic rhythmic fluctuation
    const hippus = Math.sin(time * 0.005) * 0.05;

    return baseRadius * (multiplier + hippus);
  }
}
