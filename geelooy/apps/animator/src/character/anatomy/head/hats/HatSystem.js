
// B"H
import { HatFactory } from './HatFactory.js';

/**
 * @class HatSystem
 * @description
 * THE MANAGER OF CROWNS (Menahel HaKeter).
 * B"H
 * 
 * The single, unified entry point that routes the character's divine traits 
 * to the immensely modular and separated 10-tier Hat architecture!
 */
export class HatSystem {
  /**
   * Manifests the Levush of the head!
   * @param {Object} data - The soul's characteristics.
   * @param {Object} profile - The perspective transformation plane.
   * @returns {Object|null} The final geometry group of the hat.
   */
  static build(data, profile, hTop = -95) {
    if (!data.hatType || data.hatType === 'none') return null;
    
    return HatFactory.route(data.hatType, { ...data, hTop }, profile);
  }
}
