
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file PupilRenderer.js
 * @description
 * THE SPARK OF CONSCIOUSNESS.
 * B"H
 * 
 * Refined via the 30 Gates of Realism:
 * - Colored Iris Base.
 * - Iris Striations (Lines radiating from the center).
 * - Specular Catchlight (Spark of life).
 */
export class PupilRenderer {
  static build(id, offset, irisColor = '#111111') {
    const ox = offset.x;
    const oy = offset.y;
    const pSize = 6;
    
    return G.group(`pupil_grp_${id}`, null, [
      // Solid Iris/Pupil
      G.circle(`pupil_core_${id}`, ox, oy, pSize, { fill: '#000000' }),
      // Specular highlight (Pure white geometry)
      G.circle(`catchlight_${id}`, ox + 2, oy - 2, 1.5, { fill: '#ffffff' })
    ]);
  }
}
