// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file LapelRenderer.js
 */
export class LapelRenderer {
  static build(suitColor, yCenter, h) {
    return [
      G.path('lapel_L', [
        { type: 'move', x: 0, y: yCenter - h/2 - 12 },
        { type: 'line', x: -48, y: yCenter - h/2 + 35 },
        { type: 'line', x: -12, y: yCenter - h/2 + 105 },
        { type: 'line', x: 0, y: yCenter - h/2 + 125 }
      ], { fill: suitColor, stroke: '#111', lineWidth: 2.8 }),
      // B"H - Stitching for the mastered form
      G.path('lapel_L_stitch', [
        { type: 'move', x: -5, y: yCenter - h/2 + 5 },
        { type: 'line', x: -38, y: yCenter - h/2 + 40 },
        { type: 'line', x: -15, y: yCenter - h/2 + 90 }
      ], { stroke: '#00000033', lineWidth: 1, lineDash: [3, 2] }),

      G.path('lapel_R', [
        { type: 'move', x: 0, y: yCenter - h/2 - 12 },
        { type: 'line', x: 48, y: yCenter - h/2 + 35 },
        { type: 'line', x: 12, y: yCenter - h/2 + 105 },
        { type: 'line', x: 0, y: yCenter - h/2 + 125 }
      ], { fill: suitColor, stroke: '#111', lineWidth: 2.8 }),
      // B"H - Stitching for the mastered form
      G.path('lapel_R_stitch', [
        { type: 'move', x: 5, y: yCenter - h/2 + 5 },
        { type: 'line', x: 38, y: yCenter - h/2 + 40 },
        { type: 'line', x: 15, y: yCenter - h/2 + 90 }
      ], { stroke: '#00000033', lineWidth: 1, lineDash: [3, 2] })
    ];
  }
}
