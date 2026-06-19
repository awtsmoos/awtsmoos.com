
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file Uvula.js
 * @description
 * THE PENDULUM OF BREATH (Inbal).
 * B"H
 * 
 * The fleshy teardrop hanging from the soft palate. 
 * It swings and stretches based on vocal intensity, proving the 
 * existence of extreme kinetic physics inside the 2D cutout!
 */
export class Uvula {
  static build(intensity) {
    if (intensity < 0.7) return null; // Only visible when truly shouting

    // The uvula drops lower and shrinks in width as intensity rises (stretching)
    const length = 15 + (intensity * 10);
    const width = 8 - (intensity * 2);
    
    // A slight jitter based on intense shouting
    const swingX = Math.sin(Date.now() * 0.05) * (intensity * 4);

    return G.path('uvula_organ', [
      { type: 'move', x: -width, y: -15 }, // Anchored to upper palate
      { type: 'bezier', c1x: -width, c1y: 0, c2x: swingX - width/2, c2y: length, x: swingX, y: length },
      { type: 'bezier', c1x: swingX + width/2, c1y: length, c2x: width, c2y: 0, x: width, y: -15 }
    ], { 
      fill: '#8c162e', 
      stroke: '#5c0c1d', 
      lineWidth: 2, 
      lineJoin: 'round' 
    });
  }
}
