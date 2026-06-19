
// B"H

/**
 * @file ArmLayerDecider.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE VERDICT OF THE TWO ARMS
 * ═══════════════════════════════════════════════════════════════
 *
 * The broken screenshot showed arms dangling in a way that betrayed the law:
 * depth was decided by a profile.dir that did not match flipX. This class
 * makes the verdict explicit. It only reads the already-rectified profile.dir.
 *
 * If the character faces right in three-quarter view, the left arm is far.
 * If the character faces left, the right arm is far.
 *
 * No hidden mirror. No contradictory scale. No dangling limb that thinks it
 * belongs to another body.
 *
 * @class ArmLayerDecider
 */
export class ArmLayerDecider {
  /**
   * Returns whether a side is the back arm for the current profile.
   *
   * @param {string} side - Arm side, either left or right.
   * @param {Object} profile - Direction-rectified profile.
   * @returns {boolean} True when this arm belongs behind the torso.
   */
  static isBack(side, profile) {
    const view = profile.type || 'front';
    const dir = profile.dir || 1;

    if (view !== 'side' && view !== 'threeQuarter') return false;
    return dir > 0 ? side === 'left' : side === 'right';
  }
}
