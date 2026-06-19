// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class EyelidMechanics {
  static createLids(w, scleraH, eyelidDrop, skinColor, clipPoints) {
    return G.clip('eyelid_clip', null, clipPoints, [
      G.path('eyelid_lid_top', [
        { type: 'move', x: -w * 1.5, y: -scleraH * 1.6 },
        { type: 'line', x: w * 1.5, y: -scleraH * 1.6 },
        { type: 'line', x: w * 1.5, y: -scleraH * 1.2 + (eyelidDrop * scleraH * 1.3) },
        { type: 'quad', cx: 0, cy: -scleraH * 1.2 + (eyelidDrop * scleraH * 1.6), x: -w * 1.5, y: -scleraH * 1.2 + (eyelidDrop * scleraH * 1.3) },
        { type: 'close' }
      ], { fill: skinColor, stroke: '#000', lineWidth: 1.5 }),
      G.path('eyelid_lid_bot', [
        { type: 'move', x: -w * 1.5, y: scleraH * 1.6 },
        { type: 'line', x: w * 1.5, y: scleraH * 1.6 },
        { type: 'line', x: w * 1.5, y: scleraH * 0.72 },
        { type: 'quad', cx: 0, cy: scleraH * 0.48, x: -w * 1.5, y: scleraH * 0.72 },
        { type: 'close' }
      ], { fill: skinColor, stroke: '#000', lineWidth: 1.5 })
    ]);
  }
}
