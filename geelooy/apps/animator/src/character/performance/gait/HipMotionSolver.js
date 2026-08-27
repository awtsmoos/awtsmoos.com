// B"H

/**
 * @file HipMotionSolver.js
 * @description
 * Hip, bob, and shoulder counter-motion for believable gait.
 */
export class HipMotionSolver {
  /**
   * Samples body gait.
   *
   * @param {number} phase - Phase.
   * @param {number} intensity - Intensity.
   * @returns {Object} Body offsets.
   */
  static sample(phase, intensity = 1) {
    const wave = Math.sin(phase * Math.PI * 2);
    const double = Math.sin(phase * Math.PI * 4);

    return {
      bob: (2.4 - Math.abs(double) * 3.8) * intensity,
      hipX: wave * 5.8 * intensity,
      shoulderX: -wave * 4.8 * intensity,
      torsoLean: -wave * 1.2 * intensity,
      torsoTwist: -wave * 2.2 * intensity,
      headNod: Math.sin(phase * Math.PI * 4 + 0.6) * 0.7 * intensity
    };
  }
}