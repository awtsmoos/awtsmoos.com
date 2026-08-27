
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { GraphKit } from '../GraphKit.js';

/**
 * @file CompactSageBody.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE BEARD STOPS EATING THE BODY
 * ═══════════════════════════════════════════════════════════════
 *
 * The sage should have a beard, not become only a beard. Robe, legs, and neck
 * now remain visible as distinct vessels.
 *
 * @class CompactSageBody
 */
export class CompactSageBody {
  /**
   * Builds robe and neck.
   *
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @returns {Array<Object>} Nodes.
   */
  static robe(c, m) {
    return [
      GraphKit.poly('sage_short_neck', [
        [-11, m.neckBottomY],
        [11, m.neckBottomY],
        [8, m.neckTopY],
        [-8, m.neckTopY]
      ], { fill: c.skin, stroke: c.line, lineWidth: 3, lineJoin: 'round' }),

      G.path('sage_robe_body', [
        { type: 'move', x: -48, y: m.robeTopY },
        { type: 'line', x: 48, y: m.robeTopY },
        { type: 'line', x: 35, y: m.robeBottomY },
        { type: 'quad', cx: 0, cy: m.robeBottomY + 18, x: -35, y: m.robeBottomY },
        { type: 'line', x: -48, y: m.robeTopY }
      ], { fill: c.robe, stroke: c.line, lineWidth: 4, lineJoin: 'round' }),

      G.path('sage_robe_shadow_fold', [
        { type: 'move', x: -18, y: m.robeTopY + 8 },
        { type: 'line', x: 0, y: m.robeBottomY + 10 },
        { type: 'line', x: 18, y: m.robeTopY + 8 }
      ], { stroke: c.line, lineWidth: 4, lineCap: 'round', lineJoin: 'round' })
    ];
  }

  /**
   * Builds controlled beard.
   *
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @returns {Array<Object>} Nodes.
   */
  static beard(c, m) {
    return [
      G.path('sage_beard_compact', [
        { type: 'move', x: -32, y: m.headY + 26 },
        { type: 'bezier', c1x: -36, c1y: m.headY + 62, c2x: -14, c2y: m.beardBottomY - 6, x: 0, y: m.beardBottomY },
        { type: 'bezier', c1x: 14, c1y: m.beardBottomY - 6, c2x: 36, c2y: m.headY + 62, x: 32, y: m.headY + 26 },
        { type: 'quad', cx: 0, cy: m.headY + 40, x: -32, y: m.headY + 26 }
      ], { fill: c.beard, stroke: c.line, lineWidth: 4, lineJoin: 'round' }),

      G.path('sage_beard_strands', [
        { type: 'move', x: -18, y: m.headY + 42 },
        { type: 'line', x: -8, y: m.beardBottomY - 10 },
        { type: 'move', x: 0, y: m.headY + 46 },
        { type: 'line', x: 0, y: m.beardBottomY - 4 },
        { type: 'move', x: 18, y: m.headY + 42 },
        { type: 'line', x: 8, y: m.beardBottomY - 10 }
      ], { stroke: c.beardShade, lineWidth: 2, lineCap: 'round' })
    ];
  }
}
