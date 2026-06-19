
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @class ItemVessel
 * @description
 * THE INSTRUMENTS OF ACTION.
 * B"H
 */
export class ItemVessel {
  static build(type, time) {
    if (type === 'cup') {
       return G.group('prop_cup', { y: 5 }, [
          G.path('cup_body', [
            { type: 'move', x: -10, y: -22 },
            { type: 'line', x: 10, y: -22 },
            { type: 'line', x: 8, y: 0 },
            { type: 'line', x: -8, y: 0 },
            { type: 'close' }
          ], { fill: '#ffffff', stroke: '#333', lineWidth: 1.5 }),
          G.group('steam', { y: Math.sin(time * 0.005) * 4 }, [
             G.rect('s1', -3, -35, 2, 8, { fill: 'rgba(255,255,255,0.4)', radius: 1 })
          ])
       ]);
    }
    if (type === 'phone') {
       return G.rect('prop_phone', -6, -20, 12, 22, { fill: '#111', radius: 2, stroke: '#555', lineWidth: 1 });
    }
    return null;
  }
}
