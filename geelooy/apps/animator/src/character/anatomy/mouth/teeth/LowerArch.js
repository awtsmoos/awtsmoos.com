
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class LowerArch
 * @description
 * THE FOUNDATION OF THE JAW (Mandible).
 * B"H
 * 
 * Lower teeth are rarely visible unless the jaw plunges deep into space.
 * When they appear, their separation lines are staggered intentionally, 
 * lacking the perfect symmetry of the upper incisors to create a 
 * profound, unhinged biological realism.
 * 
 * @author Chariot of the Awtsmoos
 */
export class LowerArch {
  /**
   * Manifests the lower dentition anchored to the plunging jaw line.
   * @param {number} intensity - Energy of expression.
   * @param {number} jawDrop - Millimeters of jaw opening.
   * @param {number} w - Global mouth cavity width.
   */
  static build(intensity, jawDrop, w) {
    const nodes = [];

    // The teeth are deeply tucked until the jaw snaps open
    if (jawDrop < 6 && intensity < 0.6) return nodes;

    // Anchor points track the descent of the skull mandible
    const lowerY = 12 + jawDrop;
    const lowerExt = 8 + jawDrop - (intensity * 5); // Tucked upward against lips

    // Biologically, the lower jaw teeth curve is ~10% narrower than maxilla
    const lw = w * 0.9;

    const lowerBase = G.path('lower_teeth_base', [
      { type: 'move', x: -lw, y: lowerY },
      { type: 'quad', cx: 0, cy: lowerExt, x: lw, y: lowerY },
      { type: 'line', x: lw, y: lowerY + 25 },
      { type: 'line', x: -lw, y: lowerY + 25 }
    ], { fill: '#ffffff', stroke: '#000000', lineWidth: 3, lineJoin: 'round' });
    
    nodes.push(lowerBase);

    // Staggered Separation lines to kill absolute "cleanliness" and imply imperfection
    const botGaps = [-20, -14, -6, 1, 9, 15, 21];
    
    botGaps.forEach((gx, idx) => {
      // Create organic offset: some lines lean left, some lean right
      const stagger = (idx % 2 === 0) ? 1.5 : -1.5;
      
      nodes.push(G.path(`tooth_gap_l_${gx}`, [
        { type: 'move', x: gx + stagger, y: lowerY + 2 }, // Base of lower teeth
        { type: 'line', x: gx - stagger, y: lowerExt + 2 } // Top ridge of lower teeth
      ], { stroke: '#c0c0c0', lineWidth: 2 }));
    });

    return nodes;
  }
}
