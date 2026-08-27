
// B"H
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';
import { PlantedIK } from '../../physics/PlantedIK.js';
import { StruttProfiles } from './StruttProfiles.js';

/**
 * @file StruttEngine.js
 * @description
 * CHAPTER 18: THE STEPS OF MAN
 *
 * This walk engine now carries:
 * - deterministic per-character variation
 * - mood-specific gait profiles
 * - softer foot returns
 * - richer bob, sway, arm swing, and ankle roll
 *
 * The result is still pure data, still modular,
 * but less dead and more alive.
 */
export class StruttEngine {
  /**
   * Calculates locomotion targets.
   *
   * @param {number} time - Walk clock.
   * @param {Object} data - Character data.
   * @returns {Object} Walk target values.
   */
  static calculate(time, data = {}) {
    const profile = StruttProfiles.resolve(data);
    const cycleTime = time + (profile.phaseOffset * 140);
    const cycle = (cycleTime * profile.speed) % AwtsmoosMath.TAU;
    const sin = Math.sin(cycle);
    const cos = Math.cos(cycle);

    const thighLen = 75;
    const calfLen = 75;

    const footXL = PlantedIK.getStrideAnchor(cycleTime, profile.strideLength, false, profile.speed);
    const footXR = PlantedIK.getStrideAnchor(cycleTime, profile.strideLength, true, profile.speed);

    const footYL = this.footHeight(footXL, profile);
    const footYR = this.footHeight(footXR, profile);

    const leftLeg = PlantedIK.solvePlantedLeg(0, 0, footXL, footYL, thighLen, calfLen);
    const rightLeg = PlantedIK.solvePlantedLeg(0, 0, footXR, footYR, thighLen, calfLen);

    const bodyBob = Math.abs(Math.sin(cycle * 2)) * profile.bounceAmp;
    const extraFloat = Math.max(0, Math.sin(cycle + AwtsmoosMath.HALF_PI)) * (profile.bounceAmp * 0.18);

    return {
      hipL: leftLeg.hipAngle,
      kneeL: leftLeg.kneeAngle,
      hipR: rightLeg.hipAngle,
      kneeR: rightLeg.kneeAngle,
      armL: -sin * profile.armSwing - profile.torsoLean,
      elbowL: profile.elbowBend + Math.abs(sin) * 18,
      armR: sin * profile.armSwing + profile.torsoLean,
      elbowR: profile.elbowBend + Math.abs(sin) * 18,
      bob: bodyBob + extraFloat,
      torsoSway: sin * profile.torsoSway,
      footRollL: footXL < 0 ? -12 - (profile.footLift * 0.2) : cos * 4,
      footRollR: footXR < 0 ? -12 - (profile.footLift * 0.2) : -cos * 4
    };
  }

  /**
   * Computes swing-foot height.
   *
   * @param {number} footX - Foot x anchor.
   * @param {Object} profile - Locomotion profile.
   * @returns {number} Foot y target.
   */
  static footHeight(footX, profile) {
    const groundY = 140;
    if (footX >= 0) return groundY;

    const normalized = AwtsmoosMath.clamp(Math.abs(footX) / Math.max(1, profile.strideLength), 0, 1);
    const arc = Math.sin(normalized * Math.PI);
    return groundY - (arc * profile.footLift);
  }
}
