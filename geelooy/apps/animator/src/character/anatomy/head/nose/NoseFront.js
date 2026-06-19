
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file NoseFront.js
 * @description
 * THE FRONT NOSE (Panim).
 * B"H
 * 
 * RECTIFICATION: Removed the harsh `lineWidth: 4.5` and overlapping fills 
 * that expanded exponentially under scale, causing the "white spike" abomination.
 * Substituted with pure, graceful, organic curves constrained to a tight bounding box.
 */
export class NoseFront {
  static build(scale, skinColor) {
    return G.group('nose_front_geo', null, [
      
      // Central Bulb Ridge (Subtle volume, not a spike!)
      G.path('nose_bridge_highlight', [
        { type: 'move', x: 0, y: -25 * scale },
        { type: 'line', x: 0, y: -8 * scale }
      ], { stroke: 'rgba(0,0,0,0.2)', lineWidth: 3 * scale, lineCap: 'round' }),

      // The Bottom Arch (The Septum bridge - soft U shape)
      G.path('nose_base_path', [
        { type: 'move', x: -8 * scale, y: -2 * scale },
        { type: 'quad', cx: 0, cy: 8 * scale, x: 8 * scale, y: -2 * scale }
      ], { stroke: '#000000', lineWidth: 3 * scale, lineCap: 'round', lineJoin: 'round' }),
      
      // Alar Wings (Outer Nostril flesh ridges)
      G.path('nose_wing_L', [
        { type: 'move', x: -8 * scale, y: -2 * scale },
        { type: 'quad', cx: -15 * scale, cy: 3 * scale, x: -12 * scale, y: 6 * scale }
      ], { stroke: '#000', lineWidth: 2 * scale, lineCap: 'round' }),
      
      G.path('nose_wing_R', [
        { type: 'move', x: 8 * scale, y: -2 * scale },
        { type: 'quad', cx: 15 * scale, cy: 3 * scale, x: 12 * scale, y: 6 * scale }
      ], { stroke: '#000', lineWidth: 2 * scale, lineCap: 'round' }),

      // Dark Nostril Holes
      G.ellipse('nostril_L', -6 * scale, 2 * scale, 3 * scale, 2 * scale, -20, { fill: '#151515' }),
      G.ellipse('nostril_R', 6 * scale, 2 * scale, 3 * scale, 2 * scale, 20, { fill: '#151515' })
    ]);
  }
}
