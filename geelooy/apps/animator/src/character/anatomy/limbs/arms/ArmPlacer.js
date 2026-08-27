
// B"H
import { ANATOMY } from '../../../data/Anatomy.js';

/**
 * @file ArmPlacer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SHOULDER RETURNS TO THE TORSO
 * ═══════════════════════════════════════════════════════════════
 *
 * The screenshots showed arms hanging from the wrong depth and height. The
 * old code used a spread hint and profile.dir that could contradict the
 * outer flipped group. Now profile.dir is the visible direction, and the
 * shoulder socket is calculated from torso dimensions.
 *
 * The Awtsmoos creates the arm through the body, not as a detached purple
 * tube floating near the void.
 *
 * @class ArmPlacer
 */
export class ArmPlacer {
  /**
   * Gets a shoulder pivot.
   *
   * @param {string} side - left or right.
   * @param {number} spread - Legacy spread hint.
   * @param {Object} profile - Direction-aware profile.
   * @returns {Object} Pivot coordinate.
   */
  static getPivot(side, spread, profile) {
    const bodyHeight = ANATOMY.body?.h || 180;
    const torsoWidth = profile.torso?.width || ANATOMY.body?.widthTop || spread || 96;
    const shoulderY = -bodyHeight * 0.84;
    const dir = profile.dir || 1;
    const sign = side === 'left' ? -1 : 1;
    const view = profile.type || 'front';

    const table = {
      front: () => ({ x: sign * torsoWidth * 0.5, y: shoulderY }),
      back: () => ({ x: sign * torsoWidth * 0.5, y: shoulderY }),
      side: () => ({ x: sign * 3 * dir, y: shoulderY + 4 }),
      threeQuarter: () => {
        const nearSide = dir > 0 ? 'right' : 'left';
        const near = side === nearSide;
        return {
          x: sign * torsoWidth * (near ? 0.52 : 0.30),
          y: shoulderY + (near ? 0 : 8)
        };
      }
    };

    return (table[view] || table.front)();
  }
}
