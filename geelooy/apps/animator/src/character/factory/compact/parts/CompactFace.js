
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file CompactFace.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE FACE RETURNS TO THE HEAD
 * ═══════════════════════════════════════════════════════════════
 *
 * A face on a tower is a warning. A face inside an ellipse with eyes, nose,
 * mouth, hair, and clean borders is a character.
 *
 * @class CompactFace
 */
export class CompactFace {
  /**
   * Builds a human head and face.
   *
   * @param {Object} data - Character data.
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @returns {Array<Object>} Nodes.
   */
  static human(data, c, m) {
    const open = Number.isFinite(data.vocalIntensity) && data.vocalIntensity > 0.05;
    return [
      G.ellipse('human_head', 0, m.headY, m.headRX, m.headRY, 0, { fill: c.skin, stroke: c.line, lineWidth: 4 }),
      G.ellipse('human_eye_left', -15, m.headY - 8, 10, 8, 0, { fill: '#ffffff', stroke: c.line, lineWidth: 3 }),
      G.ellipse('human_eye_right', 15, m.headY - 8, 10, 8, 0, { fill: '#ffffff', stroke: c.line, lineWidth: 3 }),
      G.circle('human_pupil_left', -12, m.headY - 7, 3, { fill: c.eyes }),
      G.circle('human_pupil_right', 18, m.headY - 7, 3, { fill: c.eyes }),
      G.path('human_nose', [
        { type: 'move', x: 0, y: m.headY },
        { type: 'line', x: 5, y: m.headY + 13 },
        { type: 'quad', cx: 0, cy: m.headY + 16, x: -5, y: m.headY + 13 }
      ], { stroke: c.line, lineWidth: 2, lineCap: 'round' }),
      G.path('human_mouth', [
        { type: 'move', x: -14, y: m.headY + 24 },
        { type: 'quad', cx: 0, cy: m.headY + (open ? 33 : 27), x: 14, y: m.headY + 24 }
      ], { stroke: c.line, lineWidth: open ? 5 : 3, lineCap: 'round' })
    ];
  }

  /**
   * Builds a sage head and face.
   *
   * @param {Object} data - Character data.
   * @param {Object} c - Colors.
   * @param {Object} m - Metrics.
   * @returns {Array<Object>} Nodes.
   */
  static sage(data, c, m) {
    const open = Number.isFinite(data.vocalIntensity) && data.vocalIntensity > 0.05;
    return [
      G.ellipse('sage_head', 0, m.headY, m.headRX, m.headRY, 0, { fill: c.skin, stroke: c.line, lineWidth: 4 }),
      G.ellipse('sage_eye_left', -14, m.headY - 6, 10, 8, 0, { fill: '#ffffff', stroke: c.line, lineWidth: 3 }),
      G.ellipse('sage_eye_right', 14, m.headY - 6, 10, 8, 0, { fill: '#ffffff', stroke: c.line, lineWidth: 3 }),
      G.circle('sage_pupil_left', -12, m.headY - 5, 3, { fill: c.eyes }),
      G.circle('sage_pupil_right', 16, m.headY - 5, 3, { fill: c.eyes }),
      G.rect('sage_glasses_bridge', -24, m.headY - 15, 48, 4, { fill: c.line }),
      G.path('sage_mouth', [
        { type: 'move', x: -13, y: m.headY + 22 },
        { type: 'quad', cx: 0, cy: m.headY + (open ? 31 : 25), x: 13, y: m.headY + 22 }
      ], { stroke: c.line, lineWidth: open ? 5 : 3, lineCap: 'round' }),
      G.ellipse('sage_hat', 0, m.headY - 47, 36, 10, 0, { fill: c.hat, stroke: c.line, lineWidth: 4 }),
      G.rect('sage_hat_band', -42, m.headY - 43, 84, 5, { fill: '#ffcc22', stroke: c.line, lineWidth: 2 })
    ];
  }
}
