
// B"H
/**
 * @file OpenMouths3Q.js
 * @description
 * THE GAPING ABYSS OF ZAIR ANPIN (3/4 Open Visemes).
 * B"H
 * 
 * Scaled down to match the new realistic Front visemes, while maintaining 
 * the skewed perspective wrap around the muzzle.
 */
export class OpenMouths3Q {
  static get(construct) {
    return {
      // 'A' - Jaw opens cleanly within the bounds of the face.
      A: construct(26, -6, -15, 32),
      
      // 'E' - Wide but tight.
      E: construct(30, -4, -6, 12),
      
      // 'O' - Rounded snout push.
      O: construct(12, -2, -18, 18),
      
      // 'L' - Tongue press visible.
      L: construct(20, -3, -10, 16),
      
      // LAUGH - 3/4 smile.
      smile: construct(28, -10, -10, 20)
    };
  }
}
