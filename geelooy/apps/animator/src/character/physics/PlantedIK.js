
// B"H
import { AwtsmoosMath } from '../../engine/core/AwtsmoosMath.js';
import { StrideEasing } from './easing/StrideEasing.js';

/**
 * @file PlantedIK.js
 * @description
 * CHAPTER 7: THE ROOTS OF MALCHUS
 *
 * The foot no longer crashes the world by reaching for a missing easing table.
 * The leg solver is guarded against zero-distance corruption.
 * The swing path is smoother and more alive.
 */
export class PlantedIK {
  /**
   * Solves a planted two-bone leg.
   *
   * @param {number} hipX - Hip x.
   * @param {number} hipY - Hip y.
   * @param {number} footTargetX - Foot x.
   * @param {number} footTargetY - Foot y.
   * @param {number} thighLen - Thigh length.
   * @param {number} calfLen - Calf length.
   * @returns {{hipAngle:number,kneeAngle:number}} Solved angles.
   */
  static solvePlantedLeg(hipX, hipY, footTargetX, footTargetY, thighLen, calfLen) {
    const dx = footTargetX - hipX;
    const dy = footTargetY - hipY;
    const distSq = Math.max(0.0001, (dx * dx) + (dy * dy));
    const dist = Math.sqrt(distSq);
    const maxReach = Math.max(1, thighLen + calfLen - 0.1);

    let clampedX = dx;
    let clampedY = dy;
    let clampedDistSq = distSq;

    if (dist > maxReach) {
      const scale = maxReach / dist;
      clampedX *= scale;
      clampedY *= scale;
      clampedDistSq = maxReach * maxReach;
    }

    let cosKnee = (
      clampedDistSq -
      (thighLen * thighLen) -
      (calfLen * calfLen)
    ) / (2 * thighLen * calfLen);
    cosKnee = AwtsmoosMath.clamp(cosKnee, -1, 1);

    let cosAlpha = (
      (thighLen * thighLen) +
      clampedDistSq -
      (calfLen * calfLen)
    ) / (2 * thighLen * Math.sqrt(clampedDistSq));
    cosAlpha = AwtsmoosMath.clamp(cosAlpha, -1, 1);

    const kneeRad = Math.acos(cosKnee);
    const alphaRad = Math.acos(cosAlpha);
    const betaRad = Math.atan2(clampedX, clampedY);
    const hipRad = betaRad + alphaRad;

    return {
      hipAngle: hipRad * (180 / Math.PI),
      kneeAngle: kneeRad * (180 / Math.PI)
    };
  }

  /**
   * Returns a horizontal stride anchor for a foot.
   *
   * @param {number} time - Walk clock.
   * @param {number} strideLength - Desired stride.
   * @param {boolean} isRightFoot - Whether this is the right foot.
   * @param {number} speed - Cycle speed.
   * @returns {number} Horizontal anchor.
   */
  static getStrideAnchor(time, strideLength, isRightFoot, speed = 0.005) {
    const safeStride = Math.max(4, Math.abs(strideLength || 0));
    const safeSpeed = Math.max(0.0001, speed || 0.005);

    const cycle = (time * safeSpeed) % AwtsmoosMath.TAU;
    const phase = isRightFoot ? cycle + Math.PI : cycle;
    const normalized = ((phase % AwtsmoosMath.TAU) + AwtsmoosMath.TAU) / AwtsmoosMath.TAU;

    if (normalized < 0.5) {
      const t = normalized / 0.5;
      return safeStride - (t * safeStride * 2);
    }

    const t = (normalized - 0.5) / 0.5;
    const eased = StrideEasing.easeOutQuad(t);
    const overshoot = (StrideEasing.easeOutBack(t) - eased) * safeStride * 0.12;
    return -safeStride + (eased * safeStride * 2) + overshoot;
  }
}
