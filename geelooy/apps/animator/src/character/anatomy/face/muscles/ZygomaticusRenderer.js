// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file ZygomaticusRenderer.js
 * @description
 * THE MUSCLE OF JOY (Chochmah & Binah pulling upwards).
 */
export class ZygomaticusRenderer {
  static build(data, profile) {
    const intensity = data.happiness || 0;
    if (intensity < 0.1) return G.group('zyg_static', null, []);
    
    // Tzimtzum: The tension lines representing contraction of light
    const tension = intensity * 15;
    
    return G.group('zyg_muscles', null, [
      G.path('zyg_L_chochmah', [
        { type: 'move', x: -30, y: 10 - tension },
        { type: 'quad', cx: -45, cy: -5 - tension, x: -35, y: -15 - tension }
      ], { stroke: 'rgba(50,20,10,0.15)', lineWidth: 3 * intensity }),
      G.path('zyg_R_binah', [
        { type: 'move', x: 30, y: 10 - tension },
        { type: 'quad', cx: 45, cy: -5 - tension, x: 35, y: -15 - tension }
      ], { stroke: 'rgba(50,20,10,0.15)', lineWidth: 3 * intensity })
    ]);
  }
}
