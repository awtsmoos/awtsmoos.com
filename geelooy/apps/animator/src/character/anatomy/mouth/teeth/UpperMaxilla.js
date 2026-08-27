
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { GumsUpper } from './GumsUpper.js';

/**
 * @class UpperMaxilla
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 25: THE HEAVENLY PILLARS OF SPEECH (Gevurah)
 * ═══════════════════════════════════════════════════════════════
 * 
 * RECTIFICATION: 
 * If `intensity` was exaggerated (e.g. 1.5 anime multiplier), `upperH` scaled 
 * out of control, causing a giant white box to blot out the entire face.
 * We now strictly clamp the height to biological reality.
 */
export class UpperMaxilla {
  static build(w, intensity) {
    const nodes = [];
    
    // Tzimtzum: The teeth anchor point drops slightly, but never into the void.
    const upperY = -12 + (Math.min(1.0, intensity) * 10); 
    
    // STRICT CLAMP: The teeth can NEVER exceed 35px in height.
    const safeIntensity = Math.min(1.0, intensity);
    const upperH = 15 + (safeIntensity * 20); 

    nodes.push(G.rect('teeth_upper_base', -w, upperY, w * 2, upperH, {
      fill: '#ffffff',
      stroke: '#000000',
      lineWidth: 4,
      radius: [0, 0, 8, 8]
    }));

    // Enamel Separation Lines
    for (let i = -w + 14; i < w; i += 16) {
      nodes.push(G.path(`u_gap_${i}`, [
        { type: 'move', x: i, y: upperY },
        { type: 'line', x: i, y: upperY + upperH - 3 }
      ], { stroke: 'rgba(0,0,0,0.3)', lineWidth: 3 }));
    }
    
    const gums = GumsUpper.build(w, upperY, safeIntensity);
    if (gums) nodes.push(gums);

    return nodes;
  }
}
