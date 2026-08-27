// B"H
import { BONE_MATH } from '../../../common/BoneMath.js';

/**
 * @class ArmSolver
 * @description
 * THE DIVINE CALCULATION OF THE REACH.
 * B"H
 */
export class ArmSolver {
  static solve(config) {
    const { 
      pivotX, pivotY, 
      upperLen, lowerLen, 
      upperAngle, lowerAngle,
      ikTarget, bendDir
    } = config;

    let finalUpperAngle = upperAngle;
    let finalLowerAngle = lowerAngle;

    if (ikTarget) {
      // Relative to shoulder pivot
      const rx = ikTarget.x - pivotX;
      const ry = ikTarget.y - pivotY;
      const ikResult = BONE_MATH.solveIK(rx, ry, upperLen, lowerLen, bendDir || 1);
      finalUpperAngle = ikResult.upper;
      finalLowerAngle = ikResult.lower;
    }

    const elbow = BONE_MATH.calcTip(pivotX, pivotY, finalUpperAngle, upperLen);
    const wrist = BONE_MATH.calcTip(elbow.x, elbow.y, finalUpperAngle + finalLowerAngle, lowerLen);

    return {
      shoulder: { x: pivotX, y: pivotY },
      elbow,
      wrist,
      totalRotation: finalUpperAngle + finalLowerAngle,
      upperAngle: finalUpperAngle,
      lowerAngle: finalLowerAngle
    };
  }
}
