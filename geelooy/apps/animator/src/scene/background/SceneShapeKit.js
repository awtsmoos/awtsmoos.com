// B"H
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';

/**
 * @file SceneShapeKit.js
 * @description
 * ============================================================================
 * CHAPTER: THE BACKGROUND SHAPE LANGUAGE
 * ============================================================================
 *
 * The background must be data-based and modular. This kit gives layers simple
 * rectangles, circles, paths, and groups through VirtualGraph.
 *
 * @class SceneShapeKit
 */
export class SceneShapeKit {
  /**
   * Creates group.
   *
   * @param {string} id - Id.
   * @param {Object|null} transform - Transform.
   * @param {Array} children - Children.
   * @returns {Object} Group.
   */
  static group(id, transform, children) {
    return G.group(id, transform || {}, (children || []).flat().filter(Boolean));
  }

  /**
   * Creates rectangle as polygon path.
   *
   * @param {string} id - Id.
   * @param {number} x - Center x.
   * @param {number} y - Center y.
   * @param {number} w - Width.
   * @param {number} h - Height.
   * @param {Object} style - Style.
   * @returns {Object} Path.
   */
  static rect(id, x, y, w, h, style) {
    const x0 = x - w / 2;
    const y0 = y - h / 2;
    const x1 = x + w / 2;
    const y1 = y + h / 2;

    return G.path(id, [
      { type: 'move', x: x0, y: y0 },
      { type: 'line', x: x1, y: y0 },
      { type: 'line', x: x1, y: y1 },
      { type: 'line', x: x0, y: y1 },
      { type: 'line', x: x0, y: y0 }
    ], style);
  }

  /**
   * Creates ellipse.
   *
   * @param {string} id - Id.
   * @param {number} x - X.
   * @param {number} y - Y.
   * @param {number} rx - Radius x.
   * @param {number} ry - Radius y.
   * @param {Object} style - Style.
   * @returns {Object} Ellipse.
   */
  static ellipse(id, x, y, rx, ry, style) {
    return G.ellipse(id, x, y, rx, ry, 0, style);
  }
}