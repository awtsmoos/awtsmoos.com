
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file SalivaStrands.js
 * @description
 * THE WATERS OF CHESED (Saliva).
 * B"H
 */
export class SalivaStrands {
  static build(intensity, jawDrop) {
    // RECTIFIED: Only trigger on high intensity (>0.6) 
    // and mid-level stretches. Snaps early.
    if (intensity < 0.65 || jawDrop < 15 || jawDrop > 45) return null;

    const topY = -12 + (intensity * 10);
    const botY = 20 + jawDrop;
    
    const w = Math.max(0.3, 2 - (jawDrop / 20));

    return G.group('saliva_vessels', { alpha: 0.45 }, [
      G.path('saliva_L', [
        { type: 'move', x: -18, y: topY + 25 },
        { type: 'bezier', c1x: -14, c1y: topY + 25 + jawDrop/2, c2x: -22, c2y: botY - jawDrop/2, x: -20, y: botY }
      ], { stroke: '#ffffff', lineWidth: w, lineCap: 'round' }),
      
      G.path('saliva_R', [
        { type: 'move', x: 25, y: topY + 22 },
        { type: 'bezier', c1x: 20, c1y: topY + 22 + jawDrop/2, c2x: 28, c2y: botY - jawDrop/2, x: 24, y: botY }
      ], { stroke: '#ffffff', lineWidth: w, lineCap: 'round' })
    ]);
  }
}
