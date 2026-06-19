
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class SalivaThreads
 * @description
 * THE WATERS OF CHESED (Viscous Connections).
 * B"H
 * 
 * Draws physical strands of moisture connecting the upper and lower teeth arrays.
 * This occurs ONLY under high vocal intensity when the jaw is actively stretching.
 * If the jaw drops too far, the threads snap and disappear. 
 * 
 * Seder Histalshelus demands these strands are pure white/translucent paths 
 * without gradients or glows.
 * 
 * @author Chariot of the Awtsmoos
 */
export class SalivaThreads {
  static build(intensity, jawDrop) {
    const nodes = [];

    // Requires intense action and a mid-level stretch. 
    // If mouth is closed (jaw < 10) they don't form. 
    // If mouth drops to 30px, they snap physically into the void.
    if (intensity > 0.8 && jawDrop > 10 && jawDrop < 28) {
      
      // Thread 1: Left canine connection, pulling diagonally toward center
      nodes.push(G.path('saliva_thread_1', [
        { type: 'move', x: -16, y: -10 },
        { type: 'bezier', c1x: -12, c1y: jawDrop/2, c2x: -20, c2y: jawDrop/2, x: -18, y: 10 + jawDrop }
      ], { 
        stroke: 'rgba(255,255,255,0.7)', 
        lineWidth: 2, 
        lineCap: 'round' 
      }));

      // Thread 2: Right lateral connection, taut and nearly snapping
      const thinning = jawDrop > 20 ? 1 : 2; // Line thins as tension rises
      nodes.push(G.path('saliva_thread_2', [
        { type: 'move', x: 22, y: -8 },
        { type: 'bezier', c1x: 18, c1y: jawDrop/2, c2x: 24, c2y: jawDrop/2, x: 20, y: 10 + jawDrop }
      ], { 
        stroke: 'rgba(255,255,255,0.5)', 
        lineWidth: thinning, 
        lineCap: 'round' 
      }));
    }

    return nodes;
  }
}
