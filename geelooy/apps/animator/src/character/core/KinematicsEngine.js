
// B"H
import { BONE_MATH } from '../anatomy/common/BoneMath.js';
import { ANATOMY } from '../data/Anatomy.js';

/**
 * @file KinematicsEngine.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE BONES OBEY THE SINGLE DECREE
 * ═══════════════════════════════════════════════════════════════
 *
 * This engine converts walking, acting, and IK into limb angles. The broken
 * scene had gestures that did not fully reach arms, and IK targets that could
 * remain after object interactions. This implementation makes the priority
 * clear:
 *
 * 1. Explicit IK target wins for the right arm.
 * 2. poseArms from ActingEngine modifies shoulders and elbows.
 * 3. walk animation supplies the baseline.
 * 4. safe defaults prevent undefined puppet collapse.
 *
 * The Awtsmoos creates the body from nothing, but in animation the bone must
 * hear one command at a time.
 *
 * @class KinematicsEngine
 */
export class KinematicsEngine {
  /**
   * Returns complete limb state.
   *
   * @param {Object} data - Character state.
   * @returns {Object} Limb kinematic state.
   */
  static getLimbState(data) {
    const walk = data.walk || {};
    const arms = {
      left: this.armState(data, 'left', walk.armL),
      right: this.armState(data, 'right', walk.armR)
    };

    if (data.ikTargetRight) {
      const solved = BONE_MATH.solveIK(
        data.ikTargetRight.x,
        data.ikTargetRight.y,
        ANATOMY.arms?.upperLength || 78,
        ANATOMY.arms?.lowerLength || 72,
        1
      );

      arms.right.shoulder = solved.upper;
      arms.right.elbow = solved.lower;
    }

    return {
      arms,
      legs: {
        left: { hip: Number.isFinite(walk.hipL) ? walk.hipL : 0, knee: Number.isFinite(walk.kneeL) ? walk.kneeL : 0 },
        right: { hip: Number.isFinite(walk.hipR) ? walk.hipR : 0, knee: Number.isFinite(walk.kneeR) ? walk.kneeR : 0 }
      }
    };
  }

  /**
   * Returns core body/head state.
   *
   * @param {Object} data - Character state.
   * @returns {Object} Core offsets.
   */
  static getCoreState(data) {
    return {
      headXOffset: Number.isFinite(data.headXOffset) ? data.headXOffset : 0,
      headYOffset: Number.isFinite(data.headYOffset) ? data.headYOffset : 0,
      headRotation: Number.isFinite(data.headTilt) ? data.headTilt : 0
    };
  }

  /**
   * Calculates one arm state.
   *
   * @param {Object} data - Character state.
   * @param {string} side - left or right.
   * @param {*} walkAngle - Walk angle contribution.
   * @returns {Object} Shoulder and elbow state.
   */
  static armState(data, side, walkAngle) {
    const base = side === 'left' ? 14 : -14;
    const pose = data.poseArms?.[side] || {};

    return {
      shoulder: base + (Number.isFinite(walkAngle) ? walkAngle : 0) + (Number.isFinite(pose.upper) ? pose.upper : 0),
      elbow: Number.isFinite(pose.lower) ? pose.lower : 8
    };
  }
}
