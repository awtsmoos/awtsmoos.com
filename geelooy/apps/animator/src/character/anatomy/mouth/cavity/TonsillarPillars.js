
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file TonsillarPillars.js
 * @description
 * THE GATES OF THE THROAT (Sha'arei HaGaron).
 * B"H
 * 
 * Hyper-realistic side pillars inside the mouth. These overlapping fleshy structures 
 * give incredible depth to screaming and roaring expressions.
 */
export class TonsillarPillars {
  static build(intensity, jawDrop) {
    if (intensity < 0.5) return null; // Only visible on wide gapes

    const stretchY = jawDrop * 0.5;

    return G.group('tonsillar_pillars', null, [
      // Left Pillar
      G.path('pillar_l', [
        { type: 'move', x: -45, y: -20 },
        { type: 'bezier', c1x: -15, c1y: -10, c2x: -25, c2y: 20 + stretchY, x: -45, y: 30 + stretchY }
      ], { fill: '#6e1124', stroke: '#4a0715', lineWidth: 3 }),
      
      // Right Pillar
      G.path('pillar_r', [
        { type: 'move', x: 45, y: -20 },
        { type: 'bezier', c1x: 15, c1y: -10, c2x: 25, c2y: 20 + stretchY, x: 45, y: 30 + stretchY }
      ], { fill: '#6e1124', stroke: '#4a0715', lineWidth: 3 })
    ]);
  }
}
