
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { GumsLower } from './GumsLower.js';

/**
 * @class LowerMandible
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 26: THE FOUNDATION OF THE JAW (Yesod)
 * ═══════════════════════════════════════════════════════════════
 */
export class LowerMandible {
  static build(w, intensity, jawDrop) {
    const nodes = [];
    
    if (jawDrop > 10 || intensity > 0.4) {
      const lowerY = 20 + jawDrop; 
      const safeIntensity = Math.min(1.0, intensity);
      const lowerH = 18 + (safeIntensity * 12);
      const lw = w * 0.85; 

      nodes.push(G.rect('teeth_lower_base', -lw, lowerY, lw * 2, lowerH, {
        fill: '#ffffff',
        stroke: '#000000',
        lineWidth: 4,
        radius: [12, 12, 0, 0]
      }));

      for (let i = -lw + 14; i < lw; i += 16) {
        nodes.push(G.path(`l_gap_${i}`, [
          { type: 'move', x: i, y: lowerY + 3 },
          { type: 'line', x: i, y: lowerY + lowerH }
        ], { stroke: 'rgba(0,0,0,0.3)', lineWidth: 3 }));
      }
      
      const gums = GumsLower.build(lw, lowerY, lowerH, safeIntensity);
      if (gums) nodes.push(gums);
    }

    return nodes;
  }
}
