
// B"H

/**
 * @file SoulLayerOrder.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE COURT OF FRONT AND BACK
 * ═══════════════════════════════════════════════════════════════
 *
 * A flat list of legs, arm, torso, head, arm is not enough for a turned body.
 * Three-quarter view needs a court of depth. The far arm must go behind, the
 * near arm must come forward, legs must not devour the torso, and the head
 * must not be buried beneath props.
 *
 * This class is data-only orchestration. It receives already-built nodes and
 * returns the canonical order.
 *
 * As the letters of creation descend through worlds, each level has an order.
 * Without order, the speech is heard as noise. With order, the body stands.
 *
 * @class SoulLayerOrder
 */
export class SoulLayerOrder {
  /**
   * Resolves the canonical realistic-human render order.
   *
   * @param {Object} nodes - Named VirtualGraph nodes.
   * @returns {Array} Ordered nodes for group assembly.
   */
  static realistic(nodes) {
    return [
      nodes.legsBack || null,
      nodes.legs || null,
      nodes.upperBodyBack || null,
      nodes.armsBack || null,
      nodes.torso || null,
      nodes.neck || null,
      nodes.head || null,
      nodes.hairFront || null,
      nodes.armsFront || null,
      nodes.accessoriesFront || null
    ].filter(Boolean);
  }
}
