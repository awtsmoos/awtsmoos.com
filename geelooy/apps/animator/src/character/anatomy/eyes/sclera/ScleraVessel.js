
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file ScleraVessel.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 20: THE PURE WHITE CANVAS (Lavan HaTehor)
 * ═══════════════════════════════════════════════════════════════
 */
export class ScleraVessel {
  static build(id, eyeBoundaryPoints) {
    return G.path(`sclera_white_${id}`, eyeBoundaryPoints, { fill: '#ffffff' });
  }

  static buildStroke(id, eyeBoundaryPoints) {
    return G.path(`sclera_stroke_${id}`, eyeBoundaryPoints, { 
      stroke: '#000000', lineWidth: 3, lineCap: 'round', lineJoin: 'round'
    });
  }
}
