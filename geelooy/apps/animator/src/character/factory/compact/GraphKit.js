
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file GraphKit.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SMALL HAMMER OF CLEAN GEOMETRY
 * ═══════════════════════════════════════════════════════════════
 *
 * The old character path let many modules draw conflicting body parts. This
 * kit gives compact assemblers a single clean set of geometric helpers. It is
 * deliberately small, pure, and data-based.
 *
 * The Awtsmoos makes worlds through letters. These helpers make bodies through
 * shapes. The letter must be clean or the body becomes a tower of chaos.
 *
 * @class GraphKit
 */
export class GraphKit {
  /**
   * Creates a closed polygon path.
   *
   * @param {string} id - Node id.
   * @param {Array<Array<number>>} points - Coordinate pairs.
   * @param {Object} style - VirtualGraph style object.
   * @returns {Object} VirtualGraph path node.
   */
  static poly(id, points, style) {
    const path = points.map((p, i) => i === 0
      ? { type: 'move', x: p[0], y: p[1] }
      : { type: 'line', x: p[0], y: p[1] }
    );
    path.push({ type: 'line', x: points[0][0], y: points[0][1] });
    return G.path(id, path, style);
  }

  /**
   * Creates a thick limb line.
   *
   * @param {string} id - Node id.
   * @param {number} x1 - Start x.
   * @param {number} y1 - Start y.
   * @param {number} x2 - End x.
   * @param {number} y2 - End y.
   * @param {number} width - Stroke width.
   * @param {string} color - Stroke color.
   * @param {string} line - Outline color.
   * @returns {Array<Object>} Limb stroke plus outline.
   */
  static limb(id, x1, y1, x2, y2, width, color, line) {
    return [
      G.path(`${id}_outline`, [
        { type: 'move', x: x1, y: y1 },
        { type: 'line', x: x2, y: y2 }
      ], { stroke: line, lineWidth: width + 6, lineCap: 'round' }),
      G.path(`${id}_fill`, [
        { type: 'move', x: x1, y: y1 },
        { type: 'line', x: x2, y: y2 }
      ], { stroke: color, lineWidth: width, lineCap: 'round' })
    ];
  }

  /**
   * Creates a safe group with nulls removed.
   *
   * @param {string} id - Node id.
   * @param {Object|null} transform - Transform object.
   * @param {Array<Object>} children - Child nodes.
   * @returns {Object} VirtualGraph group.
   */
  static group(id, transform, children) {
    return G.group(id, transform, children.filter(Boolean));
  }

  /**
   * Returns finite number or fallback.
   *
   * @param {*} value - Candidate value.
   * @param {number} fallback - Fallback value.
   * @returns {number} Safe number.
   */
  static num(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }
}
