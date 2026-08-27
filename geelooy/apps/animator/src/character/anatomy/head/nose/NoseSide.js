
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class NoseSide {
  static build(scale, dir, skinColor) {
    return G.group('nose_side_geo', null, [
      G.path('nose_side_path', [
        { type: 'move', x: 0, y: -15 * scale }, 
        // Smooth bezier curve for the tip instead of a rigid, piercing triangle
        { type: 'bezier', c1x: 15 * dir * scale, c1y: -5 * scale, c2x: 10 * dir * scale, c2y: 8 * scale, x: 0, y: 10 * scale }
      ], { 
        fill: skinColor, 
        stroke: '#000000', 
        lineWidth: 3 * scale, 
        lineCap: 'round', 
        lineJoin: 'round' 
      })
    ]);
  }
}
