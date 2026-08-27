
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { FootVessel } from './feet/FootVessel.js';
import { ThighVessel } from './parts/ThighVessel.js';
import { CalfVessel } from './parts/CalfVessel.js';
import { KneeVessel } from './parts/KneeVessel.js';
import { BONE_MATH } from '../../common/BoneMath.js';

/**
 * @file LegVessel.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE PILLAR OF MOTION STOPS FLOATING
 * ═══════════════════════════════════════════════════════════════
 *
 * A leg must remain drawable even when incoming data is rough. This vessel
 * clamps lengths, angles, and pivots before drawing the thigh, calf, knee, and
 * foot.
 *
 * The Awtsmoos gives the foot its place on the earth. The renderer must not
 * let undefined numbers lift it into emptiness.
 *
 * @class LegVessel
 */
export class LegVessel {
  /**
   * Builds a single leg vessel.
   *
   * @param {string} side - left or right.
   * @param {Object} data - Character data.
   * @param {Object} config - Leg configuration.
   * @returns {Object} VirtualGraph group.
   */
  static build(side, data, config = {}) {
    const pivotX = this.number(config.pivotX, side === 'left' ? -22 : 22);
    const pivotY = this.number(config.pivotY, -150);
    const thighLen = this.positive(config.thighLen, 82);
    const calfLen = this.positive(config.calfLen, 78);
    const thighAngle = this.clamp(this.number(config.thighAngle, 0), -55, 55);
    const calfAngle = this.clamp(this.number(config.calfAngle, 5), -20, 95);
    const pantsColor = config.pantsColor || '#333';
    const shoeColor = config.shoeColor || '#000';

    const knee = BONE_MATH.calcTip(pivotX, pivotY, thighAngle, thighLen);
    const ankle = BONE_MATH.calcTip(knee.x, knee.y, thighAngle + calfAngle, calfLen);

    return G.group(`leg_vessel_${side}`, null, [
      G.circle(`hip_socket_${side}`, pivotX, pivotY, 12, { fill: 'rgba(0,0,0,0.18)' }),
      ThighVessel.build(side, pivotX, pivotY, knee.x, knee.y, pantsColor),
      CalfVessel.build(side, knee.x, knee.y, ankle.x, ankle.y, pantsColor),
      KneeVessel.build(side, knee.x, knee.y),
      G.group(`foot_pos_${side}`, { x: ankle.x, y: ankle.y }, [
        FootVessel.build(side, data, { color: shoeColor, angle: thighAngle + calfAngle })
      ])
    ]);
  }

  /**
   * Returns finite number.
   *
   * @param {*} value - Candidate.
   * @param {number} fallback - Fallback.
   * @returns {number} Safe number.
   */
  static number(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  /**
   * Returns positive number.
   *
   * @param {*} value - Candidate.
   * @param {number} fallback - Fallback.
   * @returns {number} Safe positive number.
   */
  static positive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  /**
   * Clamps number.
   *
   * @param {number} value - Value.
   * @param {number} min - Minimum.
   * @param {number} max - Maximum.
   * @returns {number} Clamped number.
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}
