
// B"H
/**
 * @file PathDistortModifier.js
 * @brief THE WARPING OF THE VESSEL (Ikum HaKli).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE DISTORTION OF FORM
 * ═══════════════════════════════════════════════════════════════
 * Allows the geometric paths to be distorted by a mathematical noise 
 * or sine wave. It breathes organic chaos into strict rigid vectors,
 * proving that nothing is truly static in the physical realm.
 * 
 * @class PathDistortModifier
 */
export class PathDistortModifier {
  /**
   * @function apply
   * @description Warps the control points of a path node.
   * @param {Object} node - The VirtualGraph node.
   * @param {Object} params - The intensity parameters.
   * @returns {Array<Object>} The mutated spark.
   */
  static apply(node, params) {
    if (!node || node.type !== 'path' || !node.points) return [node];
    
    const amount = params.amount || 5;
    const distorted = JSON.parse(JSON.stringify(node));
    distorted.id = `${node.id}_distorted`;
    
    distorted.points.forEach((pt, i) => {
      // The organic wave of distortion
      const ox = Math.sin(i * 1.5) * amount;
      const oy = Math.cos(i * 1.5) * amount;
      
      if (pt.x !== undefined) pt.x += ox;
      if (pt.y !== undefined) pt.y += oy;
      if (pt.cx !== undefined) pt.cx += ox;
      if (pt.cy !== undefined) pt.cy += oy;
      if (pt.c1x !== undefined) pt.c1x += ox;
      if (pt.c1y !== undefined) pt.c1y += oy;
      if (pt.c2x !== undefined) pt.c2x += ox;
      if (pt.c2y !== undefined) pt.c2y += oy;
    });

    return [distorted];
  }
}
