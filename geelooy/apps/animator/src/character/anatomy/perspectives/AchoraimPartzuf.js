
import { BasePartzuf } from './BasePartzuf.js';

/**
 * @file AchoraimPartzuf.js
 * @description
 * THE PERSPECTIVE OF RESTRICTION (Achoraim).
 * B"H
 * 
 * POEM OF THE HIDDEN FACE:
 * One side of truth is all that we see,
 * In the world of the Profile, restricted and free!
 * The left eye is swallowed by shadows of old,
 * While the right eye stands witness, courageous and bold.
 * No phantom ears haunt the back of the head,
 * For the logic of Tzimtzum has put them to bed!
 * 
 * This class defines the Side Profile (Achoraim). It is the ultimate 
 * gatekeeper of occlusion, ensuring that only one side of the 
 * Partzuf is manifest to the physical world.
 * 
 * @author Chariot of the Awtsmoos
 */
export class AchoraimPartzuf extends BasePartzuf {
  /** @returns {string} The physical orientation filter type */
  get type() { return 'side'; }

  /** @returns {Object} Head spatial offsets */
  get head() { return { x: 18 * this.dir }; }

  /** @returns {Object} Body scaling factors */
  get body() { return { scaleX: 0.55 }; }
  
  /** @returns {Object} Eye visibility and positioning */
  get eyes() { 
    return { 
      visible: ['right'], // The left eye is completely nullified in this world.
      right: { x: 32, scaleX: 0.7 } // Pushed to the very edge of the facial plane.
    }; 
  }
  
  /** @returns {Object} Eyebrow visibility and positioning */
  get eyebrows() { 
    return { 
      visible: ['right'], 
      right: { x: 32, scaleX: 0.7 } 
    }; 
  }
  
  /** @returns {Object} Mouth scaling and positioning */
  get mouth() { return { x: 40, scaleX: 0.45 }; }

  /** @returns {Object} Beard scaling and positioning */
  get beard() { return { x: 15, scaleX: 0.65 }; }

  /** @returns {Object} Nose metadata for profile protrusion */
  get nose() { return { x: 42 }; }
  
  /** @returns {Object} Ear visibility - THE FIX for double ears! */
  get ears() { 
    return { 
      visible: ['near'], // Only the ear on the 'facing' side exists.
      near: { x: -20, scaleX: 1.0 } 
    }; 
  }
  
  get legs() { return { spread: 0 }; } 
  
  get arms() { return { spread: 0, dirLeft: 1, dirRight: 1 }; } 
  
  get feet() { return { angleLeft: 0, angleRight: 0, dirLeft: 1, dirRight: 1 }; }
}
