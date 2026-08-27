
// B"H
/**
 * @file TransformState.js
 * @brief THE MEMORY OF THE GRASP (Zikaron HaAchiza).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE HOLDING OF THE SPARK
 * ═══════════════════════════════════════════════════════════════
 * When the Creator reaches into the physical realm (Assiyah) to move 
 * a mountain or rotate a soul, the engine must remember the exact 
 * mathematical offsets from the moment of contact.
 * 
 * Without memory, the movement snaps and tears the fabric of space. 
 * This class is a pure data vessel, holding the origin coordinates, 
 * the current mode of Gevurah (translation, rotation, scaling), 
 * and the specific entity being subjected to the divine will.
 * 
 * @class TransformState
 */
export class TransformState {
  /** @type {Object|null} The targeted entity spark */
  static selectedEntity = null;
  
  /** @type {string} 'idle', 'translate', 'rotate', 'scale' */
  static mode = 'idle';
  
  /** @type {boolean} Is the divine hand currently grasping? */
  static isDragging = false;
  
  /** @type {number} The absolute World X origin of the click */
  static startWorldX = 0;
  
  /** @type {number} The absolute World Y origin of the click */
  static startWorldY = 0;
  
  /** @type {number} The entity's original X before manipulation */
  static initialEntityX = 0;
  
  /** @type {number} The entity's original Y before manipulation */
  static initialEntityY = 0;
  
  /** @type {number} The entity's original rotation in radians */
  static initialRotation = 0;

  /** @type {number} The entity's original scale multiplier */
  static initialScale = 1;

  /**
   * @function reset
   * @description Clears the grasping memory, returning to the void.
   */
  static reset() {
    this.isDragging = false;
    this.mode = 'idle';
    this.startWorldX = 0;
    this.startWorldY = 0;
  }
}
