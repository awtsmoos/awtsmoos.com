
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file Segments.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 11: THE PILLARS OF ACTION (Amudei Ma'aseh)
 * ═══════════════════════════════════════════════════════════════
 * 
 * The bones of the arm. This class computes the trigonometric angle 
 * between two pivot points and generates a tapered polygon that 
 * connects them, representing the flesh or the sleeve.
 * 
 * @class SegmentGeometry
 */
export class SegmentGeometry {
  static build(side, p1, p2, w1, w2, color, id) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const angle = Math.atan2(dy, dx);
    const perp = angle + Math.PI/2;
    
    const points = [
      { type: 'move', x: p1.x + Math.cos(perp) * w1, y: p1.y + Math.sin(perp) * w1 },
      { type: 'line', x: p2.x + Math.cos(perp) * w2, y: p2.y + Math.sin(perp) * w2 },
      { type: 'line', x: p2.x - Math.cos(perp) * w2, y: p2.y - Math.sin(perp) * w2 },
      { type: 'line', x: p1.x - Math.cos(perp) * w1, y: p1.y - Math.sin(perp) * w1 },
      { type: 'close' }
    ];
    
    return G.path(id, points, { 
      fill: color, 
      stroke: '#000', 
      lineWidth: 3, 
      lineJoin: 'round'
    });
  }
}
