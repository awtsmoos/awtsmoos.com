
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { ArmVessel } from './ArmVessel.js';
import { ArmPlacer } from './ArmPlacer.js';
import { ANATOMY } from '../../../data/Anatomy.js';

/**
 * @file ArmGroup.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: CHESED AND GEVURAH ACCEPT THE TRUE FRONT
 * ═══════════════════════════════════════════════════════════════
 *
 * The arm order used profile.dir. That was correct only if profile.dir was
 * correct. After the direction rectification, this module becomes simple:
 * the far arm goes back, the near arm comes forward.
 *
 * The Awtsmoos sustains both right and left. The renderer must know which one
 * is near the eye of the camera.
 *
 * @class ArmGroup
 */
export class ArmGroup {
  /**
   * Builds split front/back arm groups.
   *
   * @param {Object} data - Character data.
   * @param {Object} profile - Direction-aware profile.
   * @param {Object} kinematics - Limb kinematics.
   * @returns {Object} Front and back arm groups.
   */
  static build(data, profile, kinematics) {
    const a = ANATOMY.arms || {};
    const sleeveColor = data.colors?.clothes || data.colors?.suit || '#333';
    const skinColor = data.colors?.skin || '#f2c1a2';
    const s = data.mod?.limbs || 1.0;
    const frontArms = [];
    const backArms = [];

    ['left', 'right'].forEach(side => {
      const k = this.armKinematics(kinematics, side);
      const spread = (profile.arms?.spread || 52) + 10;
      const pivot = ArmPlacer.getPivot(side, spread, profile);

      const arm = ArmVessel.build(side, data, {
        pivotX: pivot.x * s,
        pivotY: pivot.y,
        upperLen: (a.upperLength || 78) * s,
        lowerLen: (a.lowerLength || 72) * s,
        upperAngle: k.shoulder,
        lowerAngle: k.elbow,
        sleeveColor,
        skinColor
      }, profile);

      if (this.isBackArm(side, profile)) backArms.push(arm);
      else frontArms.push(arm);
    });

    return {
      front: G.group('arms_front', null, frontArms),
      back: G.group('arms_back', null, backArms)
    };
  }

  /**
   * Returns complete kinematic data for one arm.
   *
   * @param {Object} kinematics - Kinematic state.
   * @param {string} side - Arm side.
   * @returns {Object} Shoulder and elbow.
   */
  static armKinematics(kinematics, side) {
    const k = kinematics?.arms?.[side] || {};
    return {
      shoulder: Number.isFinite(k.shoulder) ? k.shoulder : side === 'left' ? 15 : -15,
      elbow: Number.isFinite(k.elbow) ? k.elbow : 0
    };
  }

  /**
   * Returns whether this arm is behind the torso.
   *
   * @param {string} side - Arm side.
   * @param {Object} profile - Direction-aware profile.
   * @returns {boolean} Whether arm is back layer.
   */
  static isBackArm(side, profile) {
    if (profile.type !== 'side' && profile.type !== 'threeQuarter') return false;
    return profile.dir > 0 ? side === 'left' : side === 'right';
  }
}
