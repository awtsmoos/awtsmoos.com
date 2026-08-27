
// B"H
/**
 * @file ArrayModifier.js
 * @brief THE POWER OF MULTIPLICATION (Sod HaKaful).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 2: THE MULTIPLICATION OF THE SPARK
 * ═══════════════════════════════════════════════════════════════
 * Why write ten lines of JSON when one will suffice?
 * The Array Modifier takes a single seed node and emanates it 
 * multiple times, applying a 'Step' to its translation, 
 * rotation, and scale. 
 * 
 * One tree becomes a forest. One pillar becomes a temple.
 * 
 * @class ArrayModifier
 */
export class ArrayModifier {
  /**
   * @function apply
   * @description Expands a single node into a group of clones.
   * @param {Object} node - The original VirtualGraph node.
   * @param {Object} params - { count: number, offset: {x,y}, rotate: deg, scale: number }
   * @returns {Array<Object>} The resulting swarm of nodes.
   */
  static apply(node, params) {
    const clones = [];
    const count = params.count || 1;
    
    for (let i = 0; i < count; i++) {
      // Deep clone the essence of the spark
      const clone = JSON.parse(JSON.stringify(node));
      
      // Apply incremental Seder (Order)
      if (clone.x !== undefined) clone.x += (params.offset?.x || 0) * i;
      if (clone.y !== undefined) clone.y += (params.offset?.y || 0) * i;
      
      if (clone.rotation !== undefined) {
        clone.rotation += (params.rotate || 0) * i;
      }
      
      if (clone.scaleX !== undefined) clone.scaleX *= Math.pow(params.scale || 1, i);
      if (clone.scaleY !== undefined) clone.scaleY *= Math.pow(params.scale || 1, i);
      
      // Unique ID to avoid collision in the celestial realm
      clone.id = `${node.id}_arr_${i}`;
      
      clones.push(clone);
    }
    
    return clones;
  }
}
