
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { ANATOMY } from '../../data/Anatomy.js';
import { EyeVessel } from './EyeVessel.js';

/**
 * @file EyeGroup.js
 * @description
 * THE WINDOWS OF THE SOUL (Einayim).
 * B"H
 * 
 * CHAPTER: THE RECLAMATION OF SIGHT
 * The previous logic combined the default offset AND the perspective offset, 
 * pushing the eyes 50 pixels deep into the void outside the skull. 
 * Now, `config.x` establishes absolute dominance. If the PerspectiveProfile 
 * defines a coordinate, it is obeyed without question.
 */
export class EyeGroup {
  static build(data, profile, skinColor, blink, morph) {
    const { eyes: e } = ANATOMY.face;
    const eyeNodes = [];
    
    profile.eyes.visible.forEach(side => {
      const config = profile.eyes[side];
      
      // B"H - The Default Base (If no perspective override exists)
      const defaultEyeX = side === 'left' ? -e.offsetX : e.offsetX;
      
      // B"H - Absolute coordinate resolution!
      const finalX = config.x !== undefined ? config.x : defaultEyeX;
      const finalY = e.offsetY + (config.y || 0);
      
      const eyeParams = {
        x: finalX,
        y: finalY,
        scaleX: config.scaleX || 1.0,
        blink: blink,
        morph: morph,
        skinColor: skinColor,
        pupilOffset: data.eyeDart || { x: 0, y: 0 },
        emotion: data.emotion || 'neutral',
        charId: data.id || 'soul'
      };

      eyeNodes.push(EyeVessel.build(side, eyeParams));
    });

    return G.group('eyes_layer', { x: 0, y: -10 }, eyeNodes);
  }
}
