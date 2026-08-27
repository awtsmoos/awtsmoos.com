
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

/**
 * @class SkyGradientBuilder
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 42: THE RAKIA (Firmament)
 * ═══════════════════════════════════════════════════════════════
 */
export class SkyGradientBuilder {
  static build(timeOfDay, w, h) {
    const stops = [
      { time: 0.0, color: '#1a1a2e' }, 
      { time: 0.2, color: '#16213e' }, 
      { time: 0.4, color: '#0077b6' }, 
      { time: 0.5, color: '#87CEEB' }, 
      { time: 0.7, color: '#e67e22' }, 
      { time: 0.8, color: '#2c3e50' }, 
      { time: 1.0, color: '#050508' }  
    ];

    let currentFill = stops[0].color;
    for (let i = 0; i < stops.length - 1; i++) {
      const current = stops[i];
      const next = stops[i + 1];
      if (timeOfDay >= current.time && timeOfDay <= next.time) {
        const range = next.time - current.time;
        const localT = (timeOfDay - current.time) / range;
        currentFill = AwtsmoosMath.lerpColor(current.color, next.color, localT);
        break;
      }
    }

    return G.group('firmament_system', null, [
        G.rect('infinite_sky', -50000, -50000, 100000, 100000, { fill: currentFill })
    ]);
  }
}
