
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

export class GroundClutter {
  static build(startX, endX, groundY) {
    const debris = [];
    const density = 200; 
    
    for (let x = startX; x < endX; x += density) {
      const seed = x;
      const r = (offset) => AwtsmoosMath.seededRandom(seed + offset);

      if (r(1) > 0.4) {
        const px = x + (r(2) * density);
        const py = groundY + (r(3) * 40); 
        
        debris.push(G.path(`pebble_${px}`, [
          { type: 'move', x: px, y: py },
          { type: 'line', x: px + 3 + r(4)*3, y: py - 1 - r(5)*2 },
          { type: 'line', x: px + 5 + r(6)*4, y: py },
          { type: 'line', x: px + 2, y: py + 2 }
        ], { fill: '#7f8c8d', stroke: '#2c3e50', lineWidth: 0.5 }));
      }
    }

    return G.group('ground_clutter_layer', null, debris);
  }
}
