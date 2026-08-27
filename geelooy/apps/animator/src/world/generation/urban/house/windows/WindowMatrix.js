
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

export class WindowMatrix {
  static build(w, h) {
    const windows = [];
    const winCols = Math.floor(w / 60);
    const winRows = Math.floor(h / 80);
    
    for(let r=0; r<winRows; r++) {
      for(let c=0; c<winCols; c++) {
        const wx = -w/2 + 30 + (c * 60);
        const wy = -h + 40 + (r * 80);
        windows.push(G.rect(`win_${r}_${c}`, wx, wy, 24, 34, { fill: '#f1c40f', stroke: '#000', lineWidth: 2 }));
      }
    }
    return windows;
  }
}
