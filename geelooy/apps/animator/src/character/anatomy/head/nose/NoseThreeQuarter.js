
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file NoseThreeQuarter.js
 * @description
 * THE SKEWED PROTRUSION (Zair Anpin).
 * B"H
 */
export class NoseThreeQuarter {
  static build(scale, dir, skinColor) {
    return G.group('nose_3q_geo', null, [
      G.path('nose_3q_path', [
        { type: 'move', x: -8 * dir * scale, y: -18 * scale },
        { type: 'line', x: 8 * dir * scale, y: 4 * scale },
        { type: 'line', x: -5 * dir * scale, y: 12 * scale }
      ], { 
        fill: skinColor, 
        stroke: '#000000', 
        lineWidth: 3.5, 
        lineCap: 'round', 
        lineJoin: 'round' 
      })
    ]);
  }
}
