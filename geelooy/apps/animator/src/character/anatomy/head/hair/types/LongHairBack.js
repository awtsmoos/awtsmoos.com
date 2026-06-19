
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

/**
 * @file LongHairBack.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE HAIR THAT STOPPED FALLING THROUGH DIMENSIONS
 * ═══════════════════════════════════════════════════════════════
 *
 * Exact traced issue:
 * The old back hair used bottomY = h.rY * 1.8 and then added physOffY from
 * physics with "Extra heavy stretch". On a broken character this makes the
 * hair participate in the same stretched, distorted look.
 *
 * This version clamps physics sway and keeps the hair behind the skull within
 * sane bounds.
 *
 * The Awtsmoos gives hair motion, but motion is not chaos. The strand bends;
 * it does not tear the body open.
 *
 * @class LongHairBack
 * @extends HairBase
 */
export class LongHairBack extends HairBase {
  /**
   * Builds bounded long back hair.
   *
   * @param {Object} data - Character data.
   * @param {Object} profile - Perspective profile.
   * @returns {Object} VirtualGraph group.
   */
  static build(data, profile) {
    const { h, color, view, dir } = this.getParams(data, profile);

    let lx = -h.rX * 1.08;
    let rx = h.rX * 1.08;

    if (view === 'side') {
      lx = -h.rX * 1.25 * dir;
      rx = h.rX * 0.55 * dir;
    }

    const bottomY = Math.min(h.rY * 1.25, 125);
    const topY = -h.rY * 0.52;
    const physics = this.getPhysicsOffset(data);

    const backPath = [
      { type: 'move', x: lx, y: topY },
      {
        type: 'bezier',
        c1x: lx - 16,
        c1y: bottomY * 0.35,
        c2x: (lx + rx) / 2 + physics.x,
        c2y: bottomY + physics.y,
        x: rx,
        y: topY
      },
      {
        type: 'bezier',
        c1x: (lx + rx) / 2,
        c1y: topY - 26,
        c2x: lx,
        c2y: topY - 10,
        x: lx,
        y: topY
      }
    ];

    return G.group('hair_long_back_sys', null, [
      G.path('hair_long_back_path', backPath, {
        fill: color,
        stroke: '#000',
        lineWidth: 4,
        lineJoin: 'round'
      })
    ]);
  }

  /**
   * Gets clamped physics offset for hair.
   *
   * @param {Object} data - Character data.
   * @returns {Object} x and y offset.
   */
  static getPhysicsOffset(data) {
    if (!data.physics?.hair || data.physics.hair.length <= 2) {
      return { x: 0, y: 0 };
    }

    const globalPosX = data.position?.x || 0;
    const globalPosY = data.position?.y || 0;
    const tail = data.physics.hair[2];

    return {
      x: this.clamp((tail.x - globalPosX) * 0.32, -18, 18),
      y: this.clamp((tail.y - globalPosY + 70) * 0.08, -10, 18)
    };
  }

  /**
   * Clamps a number.
   *
   * @param {number} value - Value.
   * @param {number} min - Minimum.
   * @param {number} max - Maximum.
   * @returns {number} Clamped number.
   */
  static clamp(value, min, max) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(min, Math.min(max, value));
  }
}
