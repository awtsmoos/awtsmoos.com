
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file GingivalMargins.js
 * @description
 * THE BORDERS OF BONE (Gums).
 * B"H
 * 
 * Exquisite scalloped geometry bridging the teeth to the skull.
 */
export class GingivalMargins {
  static buildUpper(w, upperY, intensity) {
    if (intensity < 0.7) return null; 

    const gumPoints = [{ type: 'move', x: -w, y: upperY - 15 }];
    
    // Scalloped arches dipping between each tooth root
    const gapSpacing = 12;
    for (let i = -w; i < w; i += gapSpacing) {
      gumPoints.push({ 
        type: 'quad', 
        cx: i + (gapSpacing/2), 
        cy: upperY + 6, 
        x: i + gapSpacing, 
        y: upperY - 8 
      });
    }
    
    gumPoints.push(
      { type: 'line', x: w, y: -50 },
      { type: 'line', x: -w, y: -50 }
    );

    return G.path('gums_upper_geo', gumPoints, { 
      fill: '#ff6b8b', 
      stroke: '#a32a48', 
      lineWidth: 2.5, 
      lineJoin: 'round' 
    });
  }
}
