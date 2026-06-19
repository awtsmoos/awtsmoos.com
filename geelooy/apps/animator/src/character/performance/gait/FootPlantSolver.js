// B"H

/**
 * @file FootPlantSolver.js
 * @description
 * Grounded foot offsets for the active stable renderer. Keeps the feet readable
 * without exaggerated treadmill motion.
 */
export class FootPlantSolver {
  /**
   * Solves a leg.
   *
   * @param {Object} phaseInfo - Phase info.
   * @param {number} sideSign - -1 or 1.
   * @param {number} direction - Movement direction.
   * @param {number} stride - Stride size.
   * @returns {Object} Leg offsets.
   */
  static solve(phaseInfo, sideSign, direction, stride) {
    const planted = Boolean(phaseInfo.planted);
    const forward = phaseInfo.forward * stride * direction;
    const lateral = sideSign * 3.2;
    const lift = planted ? 0 : phaseInfo.lift;
    const bend = Number(phaseInfo.bend || 0);

    return {
      hipX: lateral * 0.12,
      kneeX: forward * 0.42 + lateral,
      ankleX: forward * 0.76 + lateral,
      footX: forward + lateral,
      kneeY: bend * 12,
      ankleY: lift * 0.28,
      footY: lift,
      footTilt: (phaseInfo.roll || 0) * direction,
      planted,
      contact: planted ? 1 : 0
    };
  }
}
