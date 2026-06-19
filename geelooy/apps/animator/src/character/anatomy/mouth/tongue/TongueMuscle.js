
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class TongueMuscle
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 27: THE FLESH OF SPEECH (Basar)
 * ═══════════════════════════════════════════════════════════════
 */
export class TongueMuscle {
  static build(intensity, jawDrop, isArched) {
    const baseY = 18 + jawDrop;
    
    const archY = isArched ? -35 : 12 - (intensity * 5); 
    
    const tonguePoints = [
      { type: 'move', x: -60, y: baseY + 20 },
      { type: 'quad', cx: 0, cy: baseY + archY, x: 60, y: baseY + 20 },
      { type: 'bezier', c1x: 45, c1y: baseY + 70, c2x: -45, c2y: baseY + 70, x: -60, y: baseY + 20 }
    ];

    return G.path('tongue_muscle_body', tonguePoints, {
      fill: '#ff4268',
      stroke: '#800020',
      lineWidth: 4,
      lineJoin: 'round'
    });
  }
}
