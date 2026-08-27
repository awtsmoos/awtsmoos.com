
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { LegVessel } from './LegVessel.js';
import { ANATOMY } from '../../../data/Anatomy.js';

/**
 * @file LegGroup.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE LEGS STAY EVEN WHEN MOTION IS SILENT
 * ═══════════════════════════════════════════════════════════════
 *
 * The original leg group could fail when kinematics were partial. This keeps
 * the original LegVessel system but provides safe standing defaults. It does
 * not replace the character style.
 *
 * The Awtsmoos creates walking and standing. Standing is not undefined.
 *
 * @class LegGroup
 */
export class LegGroup {
  /**
   * Builds both legs using the original leg vessel.
   *
   * @param {Object} data - Character data.
   * @param {Object} profile - Perspective profile.
   * @param {Object} kinematics - Kinematic state.
   * @returns {Object} VirtualGraph group.
   */
  static build(data, profile = {}, kinematics = {}) {
    const l = ANATOMY.legs || {};
    const pantsColor = data.colors?.pants || '#1a2b3c';
    const shoeColor = data.colors?.shoe || '#000';
    const s = this.num(data.mod?.limbs, 1.0);
    const spread = this.num(profile.legs?.spread, 24);
    const pivotY = this.num(l.pivotY, -150);
    const thighLen = this.num(l.thighLength, 82) * s;
    const calfLen = this.num(l.calfLength, 78) * s;

    const legs = ['left', 'right'].map(side => {
      const k = this.legKinematics(kinematics, side);
      const sign = side === 'left' ? -1 : 1;

      return LegVessel.build(side, data, {
        pivotX: sign * spread * s,
        pivotY,
        thighLen,
        calfLen,
        thighAngle: k.hip,
        calfAngle: k.knee,
        pantsColor,
        shoeColor
      });
    });

    return G.group('legs_column', null, legs);
  }

  /**
   * Returns safe leg kinematics.
   *
   * @param {Object} kinematics - Kinematic state.
   * @param {string} side - left or right.
   * @returns {Object} Hip and knee angles.
   */
  static legKinematics(kinematics, side) {
    const k = kinematics?.legs?.[side] || {};
    const sign = side === 'left' ? -1 : 1;

    return {
      hip: Number.isFinite(k.hip) ? k.hip : 3 * sign,
      knee: Number.isFinite(k.knee) ? k.knee : 5
    };
  }

  /**
   * Returns positive finite number or fallback.
   *
   * @param {*} value - Candidate number.
   * @param {number} fallback - Fallback.
   * @returns {number} Safe positive number.
   */
  static num(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
