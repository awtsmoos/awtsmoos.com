
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class MaxillaryArch
 * @description
 * THE UPPER PILLARS (Maxilla).
 * B"H
 * 
 * EXTREME RECTIFICATION:
 * Previously, the teeth were rendering at `22 + intensity * 10` height. This completely 
 * swallowed the mouth cavity, turning shouts into flat white tooth-walls!
 * Now, the upper teeth are strictly clamped to occupy only the upper quadrant of the mouth,
 * revealing the magnificent dark cavern and tongue below.
 */
export class MaxillaryArch {
  static build(w, intensity, targetViseme) {
    const nodes = [];
    
    // Tzimtzum (Contraction): Teeth height is heavily restricted. Max height of ~14px.
    const upperY = -10 + (intensity * 12); 
    let upperH = 6 + (intensity * 6); 

    // Phonetic overrides!
    // 'S' and 'E' clench the teeth together, so we drop them further.
    if (targetViseme === 'S' || targetViseme === 'E') {
      upperH += 8; 
    }

    // The core block of the upper teeth
    nodes.push(G.path('teeth_upper_base', [
      { type: 'move', x: -w, y: upperY },
      // Arching upward slightly in the center along the skull
      { type: 'quad', cx: 0, cy: upperY - 4, x: w, y: upperY },
      { type: 'line', x: w, y: upperY + upperH },
      // The biting edge, slightly arched
      { type: 'quad', cx: 0, cy: upperY + upperH + 3, x: -w, y: upperY + upperH }
    ], { fill: '#ffffff', stroke: '#000000', lineWidth: 3, lineJoin: 'round' }));

    // The individual letters of severity (Separation lines)
    const gapSpacing = 10;
    for (let i = -w + gapSpacing; i < w; i += gapSpacing) {
      nodes.push(G.path(`u_gap_${i}`, [
        { type: 'move', x: i, y: upperY },
        // Separation lines follow the arch
        { type: 'line', x: i, y: upperY + upperH + (Math.abs(i) < 15 ? 2 : 0) }
      ], { stroke: 'rgba(0,0,0,0.3)', lineWidth: 2 }));
    }

    // Pointy Canine Injections!
    const canineL = -20;
    const canineR = 20;
    
    const buildCanine = (cx) => G.path(`canine_${cx}`, [
      { type: 'move', x: cx - 4, y: upperY + upperH - 1 },
      { type: 'line', x: cx, y: upperY + upperH + 6 }, // Sharp point down!
      { type: 'line', x: cx + 4, y: upperY + upperH - 1 }
    ], { fill: '#ffffff', stroke: '#000000', lineWidth: 2, lineJoin: 'round' });

    nodes.push(buildCanine(canineL), buildCanine(canineR));

    return nodes;
  }
}
