// B"H

/**
 * @file EllipseNode.js
 * @description
 * Chapter Twelve: The orbit accepted both tongues.
 *
 * Ellipses carry shadows, eyes, ground marks, and softened motion. When their
 * dimensions arrive as object specs, the node now translates them into the
 * renderer's ancient rx/ry vessel. The Awtsmoos lets old and new callers share
 * one revealed shape.
 *
 * @module EllipseNode
 */

/**
 * @const EllipseNode
 * @description Creates ellipse graph nodes from positional or object specs.
 */
export const EllipseNode = {
  /**
   * Creates an ellipse node.
   *
   * @param {string} id - Stable node id.
   * @param {number|Object} x - X coordinate or object spec.
   * @param {number} y - Y coordinate.
   * @param {number} rx - Horizontal radius.
   * @param {number} ry - Vertical radius.
   * @param {number} rotation - Rotation degrees.
   * @param {Object} style - Style object.
   * @returns {Object} Ellipse graph node.
   */
  create: (id, x, y, rx, ry, rotation, style) => {
    if (x && typeof x === 'object') {
      const spec = x;
      return {
        type: 'ellipse',
        id,
        x: Number(spec.x) || 0,
        y: Number(spec.y) || 0,
        rx: Number(spec.rx ?? spec.radiusX ?? spec.width) || 1,
        ry: Number(spec.ry ?? spec.radiusY ?? spec.height) || 1,
        rotation: Number(spec.rotation) || 0,
        style: EllipseNode.styleOf(spec)
      };
    }

    return { type: 'ellipse', id, x, y, rx, ry, rotation, style };
  },

  /**
   * Extracts style fields from object spec.
   *
   * @param {Object} spec - Ellipse object spec.
   * @returns {Object} Style object.
   */
  styleOf(spec) {
    const { fill, stroke, lineWidth, composite } = spec;
    return { fill, stroke, lineWidth, composite };
  }
};
