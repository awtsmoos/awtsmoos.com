// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class SkylineLayerRenderer {
  static build(w, h) {
    const base = h * 0.74;
    const topBase = h * 0.43;
    const count = 9;
    const bw = w / (count - 1);
    const colors = ['#124760', '#1b667c', '#143f58', '#24758b'];
    const buildings = Array.from({ length: count }, (_, i) => {
      const x = -bw * 0.4 + i * bw;
      const top = topBase + h * ((i % 4) * 0.025);
      return this.rect(`building_${i}`, x, top, bw * 0.9, base - top, colors[i % colors.length], '#062536', 4);
    });
    const windows = [];
    for (let i = 0; i < count; i++) {
      const x0 = -bw * 0.4 + i * bw + bw * 0.18;
      const top = topBase + h * ((i % 4) * 0.025) + 32;
      const rows = Math.floor((base - top) / 48);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < 3; c++) {
          windows.push(this.rect(`win_${i}_${r}_${c}`, x0 + c * bw * 0.22, top + r * 48, bw * 0.06, 27, (r + c + i) % 3 === 0 ? '#ffe28a' : '#9fd8ff', 'rgba(0,0,0,0)', 0));
        }
      }
    }
    return G.group('skyline_layer', null, [...buildings, ...windows]);
  }

  static rect(id, x, y, w, h, fill, stroke, lineWidth) {
    return G.path(id, [
      { type: 'move', x, y },
      { type: 'line', x: x + w, y },
      { type: 'line', x: x + w, y: y + h },
      { type: 'line', x, y: y + h },
      { type: 'line', x, y }
    ], { fill, stroke, lineWidth });
  }
}