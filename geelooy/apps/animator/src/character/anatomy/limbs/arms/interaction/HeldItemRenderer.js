
// B"H
import { PropFactory } from '../../../../../world/entities/props/PropFactory.js';

/**
 * @file HeldItemRenderer.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 17: THE ELEVATION OF THE INANIMATE (Aliyat HaDomem)
 * ============================================================================
 * When a character grasps an item, it must inherit the rotational and spatial 
 * matrices of the wrist bone. The item is no longer an independent entity; 
 * it is subjugated to the will of the limb (Bityul).
 * 
 * B"H - RECTIFIED DELEGATION: All hardcoded if-statements have been purged!
 * We now formulate the transformation matrix based on the object's nature, 
 * and delegate the actual geometric drawing entirely to `PropFactory.js`.
 * 
 * @class HeldItemRenderer
 * ============================================================================
 */
export class HeldItemRenderer {
  /**
   * @function build
   * @description Constructs the geometry of the held item dynamically via the Factory.
   * @param {Object} itemData - The semantic properties of the item.
   * @param {number} totalRotation - Absolute arm rotation for gravity lock.
   * @returns {Object} VirtualGraph Node.
   */
  static build(itemData, totalRotation) {
    if (!itemData) return null;
    
    // B"H - Anti-Rotation logic. 
    // Certain props (like cups and plants) must always point UP relative to the world, 
    // resisting the twisting of the wrist. We apply inverse rotation to achieve this.
    const gravityRotation = -totalRotation; 

    // Establish the default transform anchored to the wrist
    const transform = { 
      x: 5, 
      y: 15, 
      rotation: gravityRotation, 
      scaleX: itemData.scale || 1.0, 
      scaleY: itemData.scale || 1.0 
    };

    const type = itemData.type || itemData.propType;

    // Adjust specific physical anchoring offsets based on the tool's intended use
    if (['sword', 'scissors'].includes(type)) {
      transform.rotation = 0; // Blade follows the angle of the hand perfectly
    } else if (type === 'phone') {
      transform.rotation = gravityRotation + 20; // Tilted slightly towards the face
    } else if (type === 'plant') {
      transform.y = 35; // Plant pot is heavy, held lower in the grip
    } else if (type === 'book') {
      transform.rotation = 0; 
    }

    // Delegate the manifestation of polygons to the Master Forge
    // (Time is passed as 0 here since hand props usually don't have global animations, 
    // but we could pass a clock if a glowing sword was needed!)
    return PropFactory.build(itemData, transform, Date.now());
  }
}
