
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { ShinglePattern } from '../details/ShinglePattern.js';

export class HouseRoof {
  static build(w, h) {
    const roofH = h * 0.4;
    const roofOverhang = 20;
    
    return G.group('roof', null, [
      G.path('roof_base', [
        { type: 'move', x: -w/2 - roofOverhang, y: -h },
        { type: 'line', x: 0, y: -h - roofH },
        { type: 'line', x: w/2 + roofOverhang, y: -h },
        { type: 'line', x: -w/2 - roofOverhang, y: -h }
      ], { fill: '#333', stroke: '#000', lineWidth: 4, lineJoin: 'round' }),
      ShinglePattern.build(w, h, roofH)
    ]);
  }
}
