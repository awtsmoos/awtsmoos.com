// B"H

/**
 * @file RectNode.js
 * @description
 * Chapter Ten: The rectangle remembered its own borders.
 *
 * The sky vanished because newer graph callers spoke object-language while the
 * ancient rect vessel expected positional language. The Awtsmoos sustains both
 * through one normalized node, so old code and new scene manifests can reveal
 * form without fighting over width and height.
 *
 * @module RectNode
 */

/**
 * @const RectNode
 * @description Creates rectangle graph nodes from positional or object specs.
 */
export const RectNode = {
  /**
   * Creates a rectangle node.
   *
   * @param {string} id - Stable node id.
   * @param {number|Object} x - X coordinate or object spec.
   * @param {number} y - Y coordinate.
   * @param {number} w - Width.
   * @param {number} h - Height.
   * @param {Object} style - Style object.
   * @returns {Object} Rect graph node.
   */
  create: (id, x, y, w, h, style) => {
    if (x && typeof x === 'object') {
      const spec = x;
      return {
        type: 'rect',
        id,
        x: Number(spec.x) || 0,
        y: Number(spec.y) || 0,
        w: Number(spec.w ?? spec.width) || 0,
        h: Number(spec.h ?? spec.height) || 0,
        style: RectNode.styleOf(spec)
      };
    }

    return { type: 'rect', id, x, y, w, h, style };
  },

  /**
   * Extracts style fields from object spec.
   *
   * @param {Object} spec - Rect object spec.
   * @returns {Object} Style object.
   */
  styleOf(spec) {
    const { fill, stroke, lineWidth, radius, composite } = spec;
    return { fill, stroke, lineWidth, radius, composite };
  }
};
