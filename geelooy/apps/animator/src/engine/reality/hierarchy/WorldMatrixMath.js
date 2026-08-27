
// B"H
/**
 * @file WorldMatrixMath.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 2: THE CHAIN OF WORLDS (Seder HaShalsheles)
 * ═══════════════════════════════════════════════════════════════
 * 
 * "From the highest Atzilut to the lowest Assiyah, all is linked."
 * 
 * When a soul sits upon a chair, and the chair rests upon a wagon, 
 * and the wagon moves across the earth, the soul must inherit the 
 * movement of the wagon. This is Bityul (Nullification).
 * 
 * This engine provides the geometric matrix multiplication required 
 * to collapse a deep ancestral hierarchy into a single absolute 
 * World Coordinate for the Canvas API.
 * 
 * @class WorldMatrixMath
 */

export class WorldMatrixMath {
  /**
   * @function combine
   * @description Merges a child's local transform with its parent's world transform.
   * @param {Object} child - { x, y, rotation, scaleX, scaleY }
   * @param {Object} parent - { x, y, rotation, scaleX, scaleY }
   * @returns {Object} The absolute world transform.
   */
  static combine(child, parent) {
    if (!parent) return { ...child };

    const px = parent.x || 0;
    const py = parent.y || 0;
    const pRot = (parent.rotation || 0) * (Math.PI / 180);
    const pScaleX = parent.scaleX ?? 1;
    const pScaleY = parent.scaleY ?? 1;

    const cx = child.x || 0;
    const cy = child.y || 0;

    // Apply parent's scale to child's local offset
    const scaledX = cx * pScaleX;
    const scaledY = cy * pScaleY;

    // Rotate the child's offset around the parent's origin
    const rotatedX = scaledX * Math.cos(pRot) - scaledY * Math.sin(pRot);
    const rotatedY = scaledX * Math.sin(pRot) + scaledY * Math.cos(pRot);

    return {
      x: px + rotatedX,
      y: py + rotatedY,
      rotation: (child.rotation || 0) + (parent.rotation || 0),
      scaleX: (child.scaleX ?? 1) * pScaleX,
      scaleY: (child.scaleY ?? 1) * pScaleY
    };
  }
}
