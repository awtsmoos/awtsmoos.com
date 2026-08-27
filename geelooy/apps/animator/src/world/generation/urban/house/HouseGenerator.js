
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class HouseGenerator {
  static generateHouse(x, y, w, h, color, seed, scale = 1) {
    return G.group(`house_${x}`, { x, y, scaleX: scale, scaleY: scale }, [
      G.rect('base', -w/2, -h, w, h, { fill: color, stroke: '#000', lineWidth: 4 }),
      G.path('roof', [
          { type: 'move', x: -w/2 - 20, y: -h }, { type: 'line', x: 0, y: -h - (w * 0.4) },
          { type: 'line', x: w/2 + 20, y: -h }, { type: 'close' }
      ], { fill: '#3e2723', stroke: '#000', lineWidth: 4 }),
      G.rect('door', -15, -60, 30, 60, { fill: '#5c4033', stroke: '#000', lineWidth: 3 })
    ]);
  }
}
