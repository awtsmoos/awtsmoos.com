
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { GraphKit } from '../GraphKit.js';

/**
 * @file CompactHumanBody.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: PURPLE BLOCKS BECOME CLOTHING
 * ═══════════════════════════════════════════════════════════════
 *
 * The jacket looked like floating purple blocks. This body binds shoulders,
 * jacket panels, shirt, pelvis, and short neck into one silhouette.
 *
 * @class CompactHumanBody
 */
export class CompactHumanBody {
  /**
   * Builds compact human torso.
   *
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @returns {Array<Object>} Body nodes.
   */
  static build(c, m) {
    return [
      GraphKit.poly('human_short_neck', [
        [-12, m.neckBottomY],
        [12, m.neckBottomY],
        [9, m.neckTopY],
        [-9, m.neckTopY]
      ], { fill: c.skin, stroke: c.line, lineWidth: 3, lineJoin: 'round' }),

      GraphKit.poly('human_jacket_left_panel', [
        [-m.torsoTopW / 2, m.shoulderY],
        [-5, m.shoulderY + 7],
        [-13, m.waistY],
        [-m.torsoBottomW / 2, m.waistY]
      ], { fill: c.jacket, stroke: c.line, lineWidth: 4, lineJoin: 'round' }),

      GraphKit.poly('human_jacket_right_panel', [
        [m.torsoTopW / 2, m.shoulderY],
        [5, m.shoulderY + 7],
        [13, m.waistY],
        [m.torsoBottomW / 2, m.waistY]
      ], { fill: c.jacket, stroke: c.line, lineWidth: 4, lineJoin: 'round' }),

      GraphKit.poly('human_shirt_panel', [
        [-21, m.shoulderY + 8],
        [21, m.shoulderY + 8],
        [9, m.waistY - 3],
        [0, m.waistY + 12],
        [-9, m.waistY - 3]
      ], { fill: c.shirt, stroke: c.line, lineWidth: 3, lineJoin: 'round' }),

      G.ellipse('human_left_shoulder_cap', -m.shoulderW / 2, m.shoulderY + 7, 19, 15, -0.16, { fill: c.jacket, stroke: c.line, lineWidth: 4 }),
      G.ellipse('human_right_shoulder_cap', m.shoulderW / 2, m.shoulderY + 7, 19, 15, 0.16, { fill: c.jacket, stroke: c.line, lineWidth: 4 }),

      GraphKit.poly('human_pelvis', [
        [-m.hipW / 2, m.hipY - 7],
        [m.hipW / 2, m.hipY - 7],
        [m.hipW / 2 + 5, m.hipY + 12],
        [-m.hipW / 2 - 5, m.hipY + 12]
      ], { fill: c.pants, stroke: c.line, lineWidth: 4, lineJoin: 'round' })
    ];
  }
}
