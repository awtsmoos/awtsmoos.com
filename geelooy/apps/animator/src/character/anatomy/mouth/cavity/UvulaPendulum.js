
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file UvulaPendulum.js
 * @description
 * THE PENDULUM OF BREATH (Inbal).
 * B"H
 * 
 * The fleshy teardrop hanging from the soft palate. 
 * It swings and stretches based on vocal intensity!
 */
export class UvulaPendulum {
  static build(intensity) {
    if (intensity < 0.5) return null;

    // Stretching physics
    const length = 18 + (intensity * 12);
    const width = 8 - (intensity * 2);
    
    // Violent vibration during loud speech
    const swingX = Math.sin(Date.now() * 0.08) * (intensity * 6);

    return G.path('uvula_organ', [
      { type: 'move', x: -width, y: -20 }, 
      { type: 'bezier', c1x: -width, c1y: 0, c2x: swingX - width/1.5, c2y: length, x: swingX, y: length },
      { type: 'bezier', c1x: swingX + width/1.5, c1y: length, c2x: width, c2y: 0, x: width, y: -20 }
    ], { 
      fill: '#8c162e', 
      stroke: '#4a0715', 
      lineWidth: 2.5, 
      lineJoin: 'round' 
    });
  }
}
