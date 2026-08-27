
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file GumsLower.js
 * @description
 * THE BORDERS OF THE JAW.
 * B"H
 */
export class GumsLower {
  static build(lw, lowerY, lowerH, intensity) {
    if (intensity < 0.6) return null;

    const bottomEdge = lowerY + lowerH;
    const gumPoints = [{ type: 'move', x: -lw, y: bottomEdge + 15 }];
    
    for (let i = -lw; i < lw; i += 16) {
      gumPoints.push({ type: 'quad', cx: i + 8, cy: bottomEdge - 6, x: i + 16, y: bottomEdge + 10 });
    }
    
    gumPoints.push(
      { type: 'line', x: lw, y: bottomEdge + 30 },
      { type: 'line', x: -lw, y: bottomEdge + 30 }
    );

    return G.path('gums_lower', gumPoints, { 
      fill: '#ff7a97', 
      stroke: '#b3415c', 
      lineWidth: 2, 
      lineJoin: 'round' 
    });
  }
}
