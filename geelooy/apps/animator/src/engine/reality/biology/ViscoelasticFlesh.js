
// B"H
/**
 * @file ViscoelasticFlesh.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 4: THE SHATTERING OF THE VESSELS (Shevirat HaKelim)
 * ============================================================================
 * The Infinite Light (Ohr Ein Sof) was too intense for the original vessels 
 * of creation. They shattered, creating the chaotic shards of our reality.
 * 
 * In this digital emulation, if a user pushes a facial morph target past its 
 * biological limits (e.g., forcing a smile to 300% intensity), the geometry 
 * does not simply stretch. The skin tears. The flesh stresses. The polygons 
 * physically rip to accommodate the excessive parameter.
 * 
 * THE POEM OF THE TORN SKIN:
 * The editor typed a number too grand,
 * A smile too wide for the digital land!
 * The Bezier curves began to scream,
 * Tearing the fabric of the dream!
 * Jagged red lines of stress appear,
 * As the limits of biology draw near.
 * 
 * @class ViscoelasticFlesh
 * @classdesc Evaluates morph target strain and generates stress-fracture paths.
 * ============================================================================
 */

import { VirtualGraph as G } from '../../graph/VirtualGraph.js';

export class ViscoelasticFlesh {
  /**
   * @function evaluate
   * @description Maps overloaded emotional states to physical skin tearing.
   * @param {Object} data - The character's emotional parameters.
   * @returns {Array<Object>} A collection of fracture paths to overlay on the face.
   */
  static evaluate(data) {
    const fractures = [];
    const morph = data.morphParams;
    if (!morph) return fractures;

    // Limit check: A biological smile should not exceed 1.0. 
    // If the user forces it to 1.5, we have 0.5 units of Strain.
    const smileStrain = Math.max(0, (morph.mouthSmile || 0) - 1.0);
    const angerStrain = Math.max(0, (morph.bi || 0) - 15); // Brow inner drop limit

    if (smileStrain > 0) {
      // The corners of the mouth (commissures) tear outward
      const tearLength = smileStrain * 40;
      
      // Generate jagged, bloody stress lines radiating from the mouth
      for (let i = 0; i < 5; i++) {
        const offset = (Math.random() - 0.5) * 10;
        fractures.push(G.path(`smile_tear_L_${i}`, [
          { type: 'move', x: -35, y: -10 + offset },
          { type: 'line', x: -35 - tearLength, y: -15 + (Math.random()-0.5)*20 }
        ], { stroke: 'rgba(200, 0, 0, 0.6)', lineWidth: 1.5 }));

        fractures.push(G.path(`smile_tear_R_${i}`, [
          { type: 'move', x: 35, y: -10 + offset },
          { type: 'line', x: 35 + tearLength, y: -15 + (Math.random()-0.5)*20 }
        ], { stroke: 'rgba(200, 0, 0, 0.6)', lineWidth: 1.5 }));
      }
    }

    if (angerStrain > 0) {
      // The forehead crinkles so hard the skin breaks
      const furrowDepth = angerStrain * 3;
      fractures.push(G.path('anger_fracture_1', [
        { type: 'move', x: -10, y: -45 },
        { type: 'line', x: 0, y: -45 + furrowDepth },
        { type: 'line', x: 10, y: -45 }
      ], { stroke: 'rgba(150, 0, 0, 0.8)', lineWidth: 3, lineJoin: 'miter' }));
    }

    return fractures;
  }
}
