// B"H

/**
 * @file CircleNode.js
 * @description
 * Chapter Eleven: The sun remembered its radius.
 *
 * Scene manifests speak in object specs while older renderers remembered only
 * positional chants. This node receives both without argument. A circle is the
 * sign of return: every caller can return to one normalized graph form.
 *
 * @module CircleNode
 */

/**
 * @const CircleNode
 * @description Creates circle graph nodes from positional or object specs.
 */
export const CircleNode = {
  /**
   * Creates a circle node.
   *
   * @param {string} id - Stable node id.
   * @param {number|Object} x - X coordinate or object spec.
   * @param {number} y - Y coordinate.
   * @param {number} r - Radius.
   * @param {Object} style - Style object.
   * @returns {Object} Circle graph node.
   */
  create: (id, x, y, r, style) => {
    if (x && typeof x === 'object') {
      const spec = x;
      return {
        type: 'circle',
        id,
        x: Number(spec.x) || 0,
        y: Number(spec.y) || 0,
        r: Number(spec.r ?? spec.radius) || 0,
        style: CircleNode.styleOf(spec)
      };
    }

    return { type: 'circle', id, x, y, r, style };
  },

  /**
   * Extracts style fields from object spec.
   *
   * @param {Object} spec - Circle object spec.
   * @returns {Object} Style object.
   */
  styleOf(spec) {
    const { fill, stroke, lineWidth, composite } = spec;
    return { fill, stroke, lineWidth, composite };
  }
};
