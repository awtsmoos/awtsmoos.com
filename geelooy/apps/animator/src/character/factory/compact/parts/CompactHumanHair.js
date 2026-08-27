
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file CompactHumanHair.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: HAIR BECOMES HAIR, NOT A HELMET OF CONFUSION
 * ═══════════════════════════════════════════════════════════════
 *
 * The hair looked like a rough black cap. This file splits it into back mass,
 * side strands, and front sweep so the head reads clearly.
 *
 * The Awtsmoos creates every strand from speech. Each strand bows to the head,
 * not to chaos.
 *
 * @class CompactHumanHair
 */
export class CompactHumanHair {
  /**
   * Builds back and side hair.
   *
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @returns {Array<Object>} Hair nodes.
   */
  static back(c, m) {
    return [
      G.path('human_hair_back_mass', [
        { type: 'move', x: -m.headRX * 0.9, y: m.headY - 18 },
        { type: 'bezier', c1x: -m.headRX * 1.15, c1y: m.headY + 24, c2x: -m.headRX * 0.95, c2y: m.headY + 95, x: -m.headRX * 0.52, y: m.headY + 108 },
        { type: 'line', x: m.headRX * 0.5, y: m.headY + 108 },
        { type: 'bezier', c1x: m.headRX * 0.95, c1y: m.headY + 95, c2x: m.headRX * 1.15, c2y: m.headY + 24, x: m.headRX * 0.9, y: m.headY - 18 },
        { type: 'bezier', c1x: m.headRX * 0.35, c1y: m.headY - 62, c2x: -m.headRX * 0.35, c2y: m.headY - 62, x: -m.headRX * 0.9, y: m.headY - 18 }
      ], { fill: c.hair, stroke: c.line, lineWidth: 4, lineJoin: 'round' }),

      G.path('human_hair_left_strand', [
        { type: 'move', x: -m.headRX * 0.74, y: m.headY - 22 },
        { type: 'bezier', c1x: -m.headRX * 1.1, c1y: m.headY + 16, c2x: -m.headRX * 0.75, c2y: m.headY + 72, x: -m.headRX * 0.55, y: m.headY + 88 }
      ], { stroke: c.hairHi, lineWidth: 8, lineCap: 'round' }),

      G.path('human_hair_right_strand', [
        { type: 'move', x: m.headRX * 0.76, y: m.headY - 24 },
        { type: 'bezier', c1x: m.headRX * 1.0, c1y: m.headY + 18, c2x: m.headRX * 0.72, c2y: m.headY + 68, x: m.headRX * 0.5, y: m.headY + 86 }
      ], { stroke: c.hairHi, lineWidth: 8, lineCap: 'round' })
    ];
  }

  /**
   * Builds front hair sweep.
   *
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @returns {Array<Object>} Hair nodes.
   */
  static front(c, m) {
    return [
      G.path('human_hair_front_sweep', [
        { type: 'move', x: -m.headRX + 8, y: m.headY - 26 },
        { type: 'bezier', c1x: -m.headRX * 0.28, c1y: m.headY - 72, c2x: m.headRX * 0.45, c2y: m.headY - 68, x: m.headRX - 6, y: m.headY - 24 },
        { type: 'bezier', c1x: m.headRX * 0.32, c1y: m.headY - 8, c2x: -m.headRX * 0.28, c2y: m.headY - 5, x: -m.headRX + 8, y: m.headY - 26 }
      ], { fill: c.hair, stroke: c.line, lineWidth: 4, lineJoin: 'round' }),

      G.path('human_hair_highlight', [
        { type: 'move', x: -18, y: m.headY - 48 },
        { type: 'quad', cx: 14, cy: m.headY - 58, x: 34, y: m.headY - 35 }
      ], { stroke: c.hairHi, lineWidth: 4, lineCap: 'round' })
    ];
  }
}
