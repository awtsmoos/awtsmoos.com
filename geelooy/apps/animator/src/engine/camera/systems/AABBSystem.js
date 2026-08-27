
// B"H
/**
 * @file AABBSystem.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 1: THE MEASUREMENT OF THE CAMP
 * ═══════════════════════════════════════════════════════════════
 * 
 * "And he measured the camp..." 
 * This system calculates the min/max spatial coordinates of a group 
 * of entities, creating a virtual rectangle that contains their 
 * entire physical manifestation.
 * 
 * @class AABBSystem
 */
export class AABBSystem {
  /**
   * @function getBounds
   * @description Computes the AABB for an array of characters.
   * @param {Array<Object>} targets - Active character states.
   * @returns {Object} { minX, maxX, minY, maxY, width, height, centerX }
   */
  static getBounds(targets) {
    if (!targets || targets.length === 0) {
      return { minX: -100, maxX: 100, minY: -400, maxY: 0, width: 200, height: 400, centerX: 0 };
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    targets.forEach(char => {
      const x = char.position?.x || 0;
      const y = char.position?.y || 0;
      const scale = (char.position?.scale || 1.0) * (char.mod?.body || 1.0);

      // B"H - Biological Constants
      const halfW = 150 * scale; 
      const height = 480 * scale; // Increased to protect high hats and hair

      const l = x - halfW;
      const r = x + halfW;
      const b = y;
      const t = y - height;

      if (l < minX) minX = l;
      if (r > maxX) maxX = r;
      if (t < minY) minY = t;
      if (b > maxY) maxY = b;
    });

    return {
      minX, maxX, minY, maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2
    };
  }
}
