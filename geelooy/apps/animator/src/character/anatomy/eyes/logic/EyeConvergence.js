// B"H
/**
 * @file EyeConvergence.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 37: THE FOCUS OF THE SOUL (Miykud HaNeshama)
 * ═══════════════════════════════════════════════════════════════
 * 
 * If a character holds a cup near their face, they should not stare blankly 
 * into infinity. Their pupils must physically converge inwards toward the 
 * bridge of the nose. 
 * 
 * This engine analyzes the state of the character (e.g., holding a prop, 
 * texting on a phone) and calculates a dedicated X-axis convergence offset 
 * that pushes the left pupil right, and the right pupil left.
 * 
 * @class EyeConvergence
 */

export class EyeConvergence {
  /**
   * @function getOffset
   * @description Computes the inward shift required for focal depth.
   * @param {Object} data - The character's state and held items.
   * @param {string} side - 'left' or 'right' eye identifier.
   * @returns {number} The X pixel offset to apply to the pupil.
   */
  static getOffset(data, side) {
    let convergenceAmount = 0;

    // If deeply concentrating, converge slightly to simulate deep thought
    if (data.concentration > 0.5) convergenceAmount = 1.5;

    // If holding a phone (Texting) or drinking from a cup, focus sharply!
    if (data.isTexting || data.isDrinking || data.heldItem) {
      convergenceAmount = 3.5; // Strong cross-eyed focus on the near object
    }

    // Directional translation: Left eye shifts right (+), Right eye shifts left (-)
    return side === 'left' ? convergenceAmount : -convergenceAmount;
  }
}