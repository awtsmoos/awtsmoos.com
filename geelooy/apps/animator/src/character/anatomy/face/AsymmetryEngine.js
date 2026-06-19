
// B"H
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

/**
 * @file AsymmetryEngine.js
 * @description
 * THE BEAUTY OF IMPERFECTION (Yofi Shel Pegam).
 * B"H
 * 
 * THE POEM OF THE CROOKED SMILE:
 * A perfect face is cold and dead,
 * A robotic ghost, a hollow head!
 * The Awtsmoos makes each leaf unique,
 * With a tilted brow and a sunken cheek!
 * We hash the ID of the human spark,
 * To give them a flaw in the digital dark.
 * 
 * Perfect symmetry is a hallmark of artificiality. This engine uses the character's 
 * unique ID to generate deterministic micro-offsets. One eye might be slightly smaller, 
 * the jaw slightly skewed, making the 2D cutout feel incredibly organic.
 */
export class AsymmetryEngine {
  /**
   * @function getOffsets
   * @description Generates permanent biological quirks based on the soul's ID.
   * @param {string} id - The unique identifier of the character.
   * @returns {Object} Scale and positional offsets for facial features.
   */
  static getOffsets(id) {
    if (!id) return this._defaultSymmetry();

    // Convert ID string to a numeric seed
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Deterministic random generator
    const rand = (offset) => (AwtsmoosMath.seededRandom(seed + offset) - 0.5) * 2; // -1 to 1

    return {
      eyeLeftScale: 1.0 + (rand(1) * 0.04), // +/- 4%
      eyeRightScale: 1.0 + (rand(2) * 0.04), 
      browLeftY: rand(3) * 3, // +/- 3px height difference
      browRightY: rand(4) * 3,
      jawSkewX: rand(5) * 2, // Slight jaw misalignment
      earLeftScale: 1.0 + (rand(6) * 0.08),
      earRightScale: 1.0 + (rand(7) * 0.08)
    };
  }

  static _defaultSymmetry() {
    return {
      eyeLeftScale: 1.0, eyeRightScale: 1.0,
      browLeftY: 0, browRightY: 0,
      jawSkewX: 0,
      earLeftScale: 1.0, earRightScale: 1.0
    };
  }
}
