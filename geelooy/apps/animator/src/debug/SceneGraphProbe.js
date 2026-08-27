
// B"H

/**
 * @file SceneGraphProbe.js
 * @description
 * ============================================================================
 * CHAPTER: THE JUDGE OF INVISIBLE WORLDS
 * ============================================================================
 *
 * A graph can exist and still show nothing. This probe counts children, detects
 * emptiness, and creates an emergency visible fallback when the world is black
 * but the engine claims all is well.
 *
 * @module SceneGraphProbe
 */

/**
 * @class SceneGraphProbe
 * @description
 * Validates render graphs and exposes emergency primitives.
 */
export class SceneGraphProbe {
  /**
   * Counts graph descendants.
   *
   * @param {Object} node - VirtualGraph node.
   * @returns {number} Descendant count.
   */
  static count(node) {
    if (!node) return 0;
    const children = Array.isArray(node.children) ? node.children : [];
    let total = children.length;
    for (const child of children) total += this.count(child);
    return total;
  }

  /**
   * Determines whether the graph is visibly suspicious.
   *
   * @param {Object} node - VirtualGraph node.
   * @returns {boolean} True when graph appears empty.
   */
  static isEmpty(node) {
    return this.count(node) === 0;
  }

  /**
   * Builds a plain visible fallback graph using the existing VirtualGraph API.
   *
   * @param {Object} G - VirtualGraph import.
   * @param {Object} ctxBag - Render context bag.
   * @returns {Object} Fallback group.
   */
  static fallback(G, ctxBag = {}) {
    const w = ctxBag.width || 800;
    const h = ctxBag.height || 600;
    return G.group('emergency_visible_world', null, [
      G.rect('emergency_sky', { x: 0, y: 0, width: w, height: h * 0.65, fill: '#14345a' }),
      G.rect('emergency_ground', { x: 0, y: h * 0.65, width: w, height: h * 0.35, fill: '#18542a' }),
      G.circle('emergency_head', { x: w * 0.5, y: h * 0.38, radius: 34, fill: '#ffd8b8', stroke: '#ffffff', lineWidth: 4 }),
      G.rect('emergency_body', { x: w * 0.5 - 30, y: h * 0.43, width: 60, height: 110, fill: '#5b7cff', stroke: '#ffffff', lineWidth: 4 }),
      G.rect('emergency_left_leg', { x: w * 0.5 - 28, y: h * 0.60, width: 20, height: 92, fill: '#1d2548' }),
      G.rect('emergency_right_leg', { x: w * 0.5 + 8, y: h * 0.60, width: 20, height: 92, fill: '#1d2548' })
    ]);
  }
}
