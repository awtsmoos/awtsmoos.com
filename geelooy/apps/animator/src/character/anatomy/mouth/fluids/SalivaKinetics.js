
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file SalivaKinetics.js
 * @description
 * THE WATERS OF CHESED (Saliva).
 * B"H
 * 
 * Hyper-realistic viscous strings snapping under tension. 
 * Built entirely out of sharp, low-alpha polygons (No glows!).
 */
export class SalivaKinetics {
  static build(intensity, jawDrop) {
    if (intensity < 0.5 || jawDrop < 10 || jawDrop > 45) return null;

    const lowerY = 18 + jawDrop;
    const upperY = -15 + (intensity * 10);
    
    // Polygons get thinner and sharper as tension increases
    const w = Math.max(1, 6 - (jawDrop / 10)); 
    const alpha = Math.max(0.1, 0.7 - (jawDrop / 60));

    const buildStrand = (id, xTop, xBot) => G.path(`saliva_${id}`, [
      { type: 'move', x: xTop - w, y: upperY + 20 },
      { type: 'line', x: xTop + w, y: upperY + 20 },
      // Narrowing to a point at the bottom
      { type: 'line', x: xBot + w/2, y: lowerY },
      { type: 'line', x: xBot - w/2, y: lowerY }
    ], { fill: `rgba(255, 255, 255, ${alpha})` });

    return G.group('saliva_physics', null, [
      buildStrand('canine_L', -22, -26),
      buildStrand('canine_R', 22, 26),
      buildStrand('center_micro', -4, -2) // A tiny center strand that snaps early
    ]);
  }
}
