
// B"H
import { ANATOMY } from '../../../data/Anatomy.js';

/**
 * @class HairBase
 * @description
 * THE SHIELD OF THE BROW.
 * B"H
 * 
 * Flawless synchronization: Hair bounds dynamically calculate from the 
 * EXACT radius values used by the Skull generator! It can never misalign!
 */
export class HairBase {
  static getParams(data, profile) {
    return {
      h: ANATOMY.head,
      color: data.colors?.hair || '#1a1a1a',
      view: profile.type || 'front',
      dir: profile.dir || 1
    };
  }

  /**
   * Generates the universally safe hairline boundary bridging across the forehead.
   * This anchors EVERY hairstyle securely to the cranium without overriding the eyebrows!
   */
  static getForeheadArc(h, dir, view) {
    // Top of forehead, above the eyes. 
    const templeY = -h.rY * 0.45; 
    
    // Arching slightly up in the center
    const apexY = -h.rY * 0.65; 
    
    let lx = -h.rX;
    let rx = h.rX;

    if (view === 'side') { 
      // B"H - Mapping to SkullPath constants
      lx = h.rX * 1.15 * -dir; 
      rx = h.rX * 0.82 * dir; 
    } else if (view === 'threeQuarter') { 
      lx = -h.rX * 0.85; 
      rx = h.rX * 0.9;
    }

    // B"H - Normalized points for consistency across left/right facing
    const p1 = dir > 0 ? rx : lx;
    const p2 = dir > 0 ? lx : rx;

    return [
      // Starting side (Face side usually)
      { type: 'move', x: p1, y: templeY },
      // Arching over the forehead to the other temple (Back of head usually)
      { type: 'bezier', c1x: p1 * 0.5, c1y: apexY, c2x: p2 * 0.5, c2y: apexY, x: p2, y: templeY }
    ];
  }
}
