
/* B”H */

/**
 * @class BoneEngine
 * @description
 * Mathematical calculation of joint chains. 
 * Uses trigonometry to resolve local rotations into world matrices.
 * This is the Da'at (Knowledge) that connects the limb segments.
 */
export class BoneEngine {
  /**
   * Resolves a bone segment's world position and rotation.
   * @param {Object} parent - Parent matrix {x, y, rotation}
   * @param {number} length - Bone length
   * @param {number} localRotation - Local angle in degrees
   */
  static resolve(parent, length, localRotation) {
    const rad = (parent.rotation + localRotation) * Math.PI / 180;
    
    // Calculate tip of the current bone based on its length and total angle
    const tipX = parent.x + Math.sin(rad) * length;
    const tipY = parent.y + Math.cos(rad) * length;

    return {
      x: tipX,
      y: tipY,
      rotation: parent.rotation + localRotation
    };
  }

  /**
   * Helper to create a starting root matrix.
   */
  static root(x, y, rotation = 0) {
    return { x, y, rotation };
  }
}
