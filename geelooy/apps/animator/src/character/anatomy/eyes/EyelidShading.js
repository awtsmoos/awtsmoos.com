// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class EyelidShading {
  static generateHatching(w, scleraH) {
    const renderLine = (id, x1, y1, x2, y2) => G.path(id, [
      { type: 'move', x: x1, y: y1 },
      { type: 'line', x: x2, y: y2 }
    ], { stroke: '#00000033', lineWidth: 1 });

    return [
      renderLine('eyelid_hatch_1', -w * 0.8, -scleraH * 0.6, -w * 0.6, -scleraH * 0.4),
      renderLine('eyelid_hatch_2', -w * 0.4, -scleraH * 0.65, -w * 0.2, -scleraH * 0.45),
      renderLine('eyelid_hatch_3', 0, -scleraH * 0.7, w * 0.2, -scleraH * 0.5),
      renderLine('eyelid_hatch_4', w * 0.4, -scleraH * 0.65, w * 0.6, -scleraH * 0.45),
      renderLine('eyelid_hatch_5', w * 0.8, -scleraH * 0.6, w * 1.0, -scleraH * 0.4),
      G.path('eye_bag_1', [
           { type: 'move', x: -w * 0.6, y: scleraH * 0.4 },
           { type: 'quad', cx: 0, cy: scleraH * 0.6, x: w * 0.6, y: scleraH * 0.4 }
      ], { stroke: '#00000022', lineWidth: 1 })
    ];
  }
}
