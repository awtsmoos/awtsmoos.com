
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class MandibularArch
 * @description
 * THE LOWER FOUNDATION (Mandible).
 * B"H
 * 
 * Scaled down height so they don't cover the entire dark mouth void!
 */
export class MandibularArch {
  static build(w, intensity, jawDrop, targetViseme) {
    const nodes = [];
    
    // Only show lower teeth if the jaw actually drops or intensity is high
    if (jawDrop > 8 || intensity > 0.4 || targetViseme === 'S') {
      
      // Anchored to the bottom of the massive jawDrop constraints
      const lowerY = 15 + jawDrop; 
      
      // Tzimtzum: Limit height to a small row.
      let lowerH = 6 + (intensity * 4);
      if (targetViseme === 'S' || targetViseme === 'E') lowerH += 6; 

      const lw = w * 0.85; // Lower arch is narrower

      nodes.push(G.path('teeth_lower_base', [
        { type: 'move', x: -lw, y: lowerY },
        // Biting edge dipping slightly in the center
        { type: 'quad', cx: 0, cy: lowerY + 3, x: lw, y: lowerY },
        { type: 'line', x: lw, y: lowerY + lowerH },
        { type: 'line', x: -lw, y: lowerY + lowerH }
      ], { fill: '#ffffff', stroke: '#000000', lineWidth: 3, lineJoin: 'round' }));

      // Staggered teeth separation
      const gapSpacing = 10;
      let offsetToggle = true;
      for (let i = -lw + gapSpacing; i < lw; i += gapSpacing) {
        const xOffset = offsetToggle ? 1 : -1;
        offsetToggle = !offsetToggle;
        
        nodes.push(G.path(`l_gap_${i}`, [
          { type: 'move', x: i + xOffset, y: lowerY + 1 },
          { type: 'line', x: i, y: lowerY + lowerH }
        ], { stroke: 'rgba(0,0,0,0.3)', lineWidth: 1.5 }));
      }
    }

    return nodes;
  }
}
