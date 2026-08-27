
// B"H
/**
 * @file ShoePhysics.js
 * @brief THE GROUNDING OF THE SOUL (Karka).
 */
export class ShoePhysics {
  /**
   * @function getImpactScale
   * @description Calculates the squash-and-stretch of the shoe.
   * @param {number} bob - The current vertical oscillation.
   * @param {number} velocityY - Current jumping speed.
   */
  static getImpactScale(bob, velocityY) {
    // If the character is at the absolute bottom of their bob cycle (striking ground)
    const impact = Math.abs(bob) < 2 ? 1.15 : 1.0;
    const stretch = velocityY > 5 ? 0.9 : 1.0; // Thinner when flying up
    
    return {
      scaleX: impact,
      scaleY: 1.0 / impact * stretch
    };
  }
}
