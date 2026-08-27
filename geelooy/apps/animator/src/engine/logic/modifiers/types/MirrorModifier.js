
// B"H
/**
 * @file MirrorModifier.js
 * @brief THE SYMMETRY OF BEING (Hishtakfut).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 3: THE RIGHT AND THE LEFT
 * ═══════════════════════════════════════════════════════════════
 * "He set the one over against the other."
 * Mirroring allows us to define the Right arm and receive the 
 * Left arm for free. It flips the X-coordinates of every Bezier 
 * point and reverses the winding order of the paths.
 * 
 * @class MirrorModifier
 */
export class MirrorModifier {
  /**
   * @function apply
   * @description Creates a mirrored reflection of the node.
   * @param {Object} node - The node to reflect.
   * @param {Object} params - { axis: 'x'|'y', offset: number }
   * @returns {Array<Object>} The original plus its reflection.
   */
  static apply(node, params) {
    const axis = params.axis || 'x';
    const mirror = JSON.parse(JSON.stringify(node));
    
    mirror.id = `${node.id}_mirrored`;

    if (axis === 'x') {
      // Flip the scale to reflect the world
      mirror.scaleX = (mirror.scaleX || 1) * -1;
      
      // Mirror the points inside a path if it is a path node
      if (mirror.points) {
        mirror.points.forEach(p => {
          if (p.x !== undefined) p.x *= -1;
          if (p.cx !== undefined) p.cx *= -1;
          if (p.c1x !== undefined) p.c1x *= -1;
          if (p.c2x !== undefined) p.c2x *= -1;
        });
      }
    }

    return [node, mirror];
  }
}
