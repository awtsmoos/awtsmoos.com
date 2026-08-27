
/* B”H */

/**
 * @class NodeFactory
 * @description
 * THE ALPHABET OF FORMATION (Otiyot HaYesod).
 * Creates pure JSON objects representing the desired state of physical reality.
 * No canvas context is ever touched here. This is the realm of Atzilut (Emanation)
 * and Beriah (Creation), existing purely as data before manifestation.
 */
export const NodeFactory = {
  /**
   * A container for multiple souls (nodes).
   */
  group: (id, transform, children, style = {}) => ({
    type: 'group',
    id,
    transform: transform || { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    style,
    children: (children || []).filter(Boolean) // Purge the void (null/undefined)
  }),

  /**
   * The foundation of boundaries.
   */
  rect: (id, x, y, w, h, style) => ({
    type: 'rect', id, x, y, w, h, style
  }),

  /**
   * The infinite loop.
   */
  circle: (id, x, y, r, style) => ({
    type: 'circle', id, x, y, r, style
  }),

  /**
   * The distorted infinite.
   */
  ellipse: (id, x, y, rx, ry, rotation, style) => ({
    type: 'ellipse', id, x, y, rx, ry, rotation, style
  }),

  /**
   * The journey of a spark.
   * Accepts points in the format {type: 'move'|'line'|'bezier', x, y, ...}
   */
  path: (id, points, style) => ({
    type: 'path', id, points, style
  }),

  /**
   * The divine speech manifested.
   */
  text: (id, text, x, y, style) => ({
    type: 'text', id, text, x, y, style
  })
};
