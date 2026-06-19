
// B"H
/**
 * @file NodeSearcher.js
 * @description
 * THE SEEKER OF SPARKS (Choresh HaNitzotzot).
 * B"H
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 4: NAVIGATING THE TREE OF LIFE
 * ═══════════════════════════════════════════════════════════════
 * The VirtualGraph is a deeply nested JSON hierarchy representing 
 * all physical reality. To attach a sword to a hand, we must first 
 * find the hand.
 * 
 * This class performs ultra-fast recursive sweeps through the JSON 
 * tree to locate specific container nodes by their holy IDs.
 * 
 * @class NodeSearcher
 */
export class NodeSearcher {
  /**
   * @function find
   * @description Locates a node anywhere in the tree by its exact ID.
   */
  static find(node, targetId) {
    if (!node) return null;
    if (node.id === targetId) return node;
    
    if (node.children && Array.isArray(node.children)) {
      for (let i = 0; i < node.children.length; i++) {
        const found = this.find(node.children[i], targetId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * @function findAndRemove
   * @description Locates a node, severs it from its parent's children array, and returns it.
   */
  static findAndRemove(parent, targetId) {
    if (!parent || !parent.children || !Array.isArray(parent.children)) return null;

    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      if (!child) continue;

      if (child.id === targetId || (child.id && child.id.includes(targetId))) {
        return parent.children.splice(i, 1)[0];
      }

      const found = this.findAndRemove(child, targetId);
      if (found) return found;
    }
    return null;
  }
}
