
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file TonsilArches.js
 * @description
 * THE GATES OF THE THROAT (Sha'arei HaGaron).
 * B"H
 * 
 * Hyper-realistic geometric side pillars inside the mouth. 
 * They stretch exponentially during a scream.
 */
export class TonsilArches {
  static build(intensity, jawDrop) {
    if (intensity < 0.3) return null;

    const stretchY = jawDrop * 0.6;
    const thickness = 6 - (intensity * 2); // Thins out as it stretches

    return G.group('tonsillar_arches', null, [
      // Left Arch
      G.path('arch_l', [
        { type: 'move', x: -45, y: -25 },
        { type: 'bezier', c1x: -12, c1y: -10, c2x: -25, c2y: 25 + stretchY, x: -45, y: 35 + stretchY }
      ], { fill: '#6e1124', stroke: '#360510', lineWidth: thickness }),
      
      // Right Arch
      G.path('arch_r', [
        { type: 'move', x: 45, y: -25 },
        { type: 'bezier', c1x: 12, c1y: -10, c2x: 25, c2y: 25 + stretchY, x: 45, y: 35 + stretchY }
      ], { fill: '#6e1124', stroke: '#360510', lineWidth: thickness })
    ]);
  }
}
