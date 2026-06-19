
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

export class SidingLines {
  static build(w, h) {
    const lines = [];
    for(let sy = -h; sy < 0; sy += 10) {
      lines.push(G.path(`siding_${sy}`, [
        { type: 'move', x: -w/2, y: sy }, { type: 'line', x: w/2, y: sy }
      ], { stroke: 'rgba(0,0,0,0.1)', lineWidth: 1 }));
    }
    return lines;
  }
}
