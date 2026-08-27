
// B"H
/**
 * @file CinematicCameraPresets.js
 * @brief THE ARCHITECT OF PERSPECTIVE.
 * 
 * POEM OF THE DIVINE OBSERVER:
 * Whether close to the soul or far from the shore,
 * The camera watches, and asks for more!
 * It centers the visage, it centers the grace,
 * Finding the light in each manifest face.
 */

export class CinematicCameraPresets {
  /**
   * Translates a shot intent into absolute camera coordinates.
   */
  static get(type, state, targetId) {
    const characters = state.get('characters') || {};
    const targetChar = characters[targetId];
    
    // Default to void center if target is missing
    const tx = targetChar ? targetChar.position.x : 0;
    const ty = targetChar ? targetChar.position.y : 0;

    const shots = {
      // THE MACRO GAZE (Eyes and Mouth Only)
      // B"H - Shifted from -180 to -85 to center on the speaking vessel (mouth)
      'closeup': { x: tx, y: ty - 85, zoom: 4.8 },
      
      // THE EXPRESSIVE FRAME (Head and Shoulders)
      'midshot': { x: tx, y: ty - 80, zoom: 2.2 },
      
      // THE WORLD FRAME (Full Body and Atmosphere)
      'wide': { x: tx, y: ty - 40, zoom: 1.0 },
      
      // THE ASSEMBLY (Averages between two targets)
      'twoShot': (idB) => {
        const charB = characters[idB];
        const bx = charB ? charB.position.x : tx;
        return { x: (tx + bx) / 2, y: ty - 60, zoom: 1.1 };
      }
    };

    const preset = shots[type] || shots.wide;
    return typeof preset === 'function' ? preset : preset;
  }
}
