
// B"H
/**
 * @file ReactiveFlora.js
 * @description
 * THE RUSTLING OF THE LEAVES (Pachad HaTeva).
 * B"H
 * 
 * The world cannot be a static painting. It must react to the presence of the 
 * souls within it. When a character's bounding box intersects with the geometry 
 * of a bush or grass, the physical X-velocity of the character transfers a 
 * "bend force" into the plant, causing it to lean away organically.
 */
export class ReactiveFlora {
  /**
   * @function calculateBendForce
   * @description Computes the disruption vector caused by nearby characters.
   * @param {number} plantX - The world X coordinate of the plant.
   * @param {Object} characters - The global dictionary of active souls.
   * @returns {number} The angular bend modifier to apply to the plant's Bezier/rotation.
   */
  static calculateBendForce(plantX, characters) {
    let totalForce = 0;

    Object.values(characters || {}).forEach(char => {
      if (!char.position) return;
      
      const charX = char.position.x;
      const charVelX = char.velocity?.x || (char.isWalking ? (char.flipX ? -5 : 5) : 0);
      
      // Calculate distance between the plant and the entity
      const distance = plantX - charX;
      
      // If within influence radius (150px)
      if (Math.abs(distance) < 150) {
        // The closer they are, the stronger the force.
        // If char is to the left (negative dist), force pushes right (positive).
        const magnitude = (150 - Math.abs(distance)) / 150;
        
        // Transfer velocity into angular rotation (radians)
        totalForce += (charVelX * magnitude) * 0.05;
      }
    });

    return totalForce;
  }
}
