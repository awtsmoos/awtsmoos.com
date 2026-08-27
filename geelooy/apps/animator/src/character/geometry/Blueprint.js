
/* B”H */

/**
 * @class Blueprint
 * @description
 * An abstract geometric vessel. Contains points, types, and colors,
 * but knows nothing of the Canvas context. 
 * It is pure data, awaiting manifestation.
 */
export class Blueprint {
  constructor(type, data = {}) {
    this.type = type; // 'path', 'circle', 'ellipse', 'rect'
    this.data = data;
    this.children = [];
  }

  addChild(blueprint) {
    this.children.push(blueprint);
  }

  /**
   * Translates a high-level intent into a data-only schema.
   */
  static createPath(points, styles = {}) {
    return new Blueprint('path', { points, ...styles });
  }

  static createCircle(cx, cy, r, styles = {}) {
    return new Blueprint('circle', { cx, cy, r, ...styles });
  }

  static createEllipse(cx, cy, rx, ry, rotation, styles = {}) {
    return new Blueprint('ellipse', { cx, cy, rx, ry, rotation, ...styles });
  }
}
