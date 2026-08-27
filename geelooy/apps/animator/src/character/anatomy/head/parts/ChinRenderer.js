
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file ChinRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE PURGE OF CHAOS (Biur HaTohu)
 * ═══════════════════════════════════════════════════════════════
 * 
 * The Awtsmoos demands clarity. The previous rendering engine attempted 
 * to simulate muscle fibers by firing 29 random lines across the jaw. 
 * But randomness without a deterministic seed is Tohu (Chaos)—it resulted 
 * in a dirty, scribbled mess that broke the clean aesthetic of the vessel.
 * 
 * We have purged the chaotic loops. The chin is now defined by a single, 
 * bold, organic cleft—a stroke of pure geometric intention.
 */
export class ChinRenderer {
  static build(rx, ry, color) {
    const nodes = [
      G.ellipse('chin_flesh', 0, ry-5, rx*0.8, 15, 0, { fill: color })
    ];
    
    // B"H - Pure, clean, deterministic cleft geometry. No random scribbles.
    const cleft = G.path('chin_cleft', [
      { type: 'move', x: -6, y: ry + 2 },
      { type: 'bezier', c1x: -2, c1y: ry + 10, c2x: 2, c2y: ry + 10, x: 6, y: ry + 2 }
    ], { stroke: 'rgba(0,0,0,0.15)', lineWidth: 2, lineCap: 'round' });

    nodes.push(cleft);

    return G.group('chin_group', null, nodes);
  }
}
