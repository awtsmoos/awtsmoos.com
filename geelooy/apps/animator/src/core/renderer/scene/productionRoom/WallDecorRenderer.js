// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class WallDecorRenderer {
  static build(w = 1200, h = 900) {
    return G.group('production_wall_decor', null, [
      this.frame('hebrew_plaque', w * 0.42, -h * 0.28, 112, 70, 'דרך ארץ'),
      this.frame('small_portrait', w * 0.52, -h * 0.33, 68, 82, 'B"H'),
      this.clock(w * 0.31, -h * 0.24),
      this.coatHooks(w * 0.88, h * 0.08)
    ]);
  }

  static frame(id, x, y, ww, hh, label) {
    return G.group(id, null, [
      G.rect(`${id}_paper`, { x, y, width: ww, height: hh, fill: '#f4e5ba', stroke: '#5a3418', lineWidth: 5 }),
      G.text(`${id}_text`, label, x + ww * 0.18, y + hh * 0.55, { font: 'bold 16px sans-serif', fill: '#4c2a14' })
    ]);
  }

  static clock(x, y) {
    return G.group('wall_clock', null, [
      G.circle('clock_face', { x, y, radius: 28, fill: '#f8efcf', stroke: '#5a3418', lineWidth: 4 }),
      G.path('clock_hands', [
        { type: 'move', x, y }, { type: 'line', x: x + 2, y: y - 15 },
        { type: 'move', x, y }, { type: 'line', x: x + 12, y: y + 5 }
      ], { stroke: '#5a3418', lineWidth: 3 })
    ]);
  }

  static coatHooks(x, y) {
    return G.group('coat_hooks', null, [
      G.rect('hook_bar', { x: x - 60, y, width: 120, height: 9, fill: '#5a3418' }),
      ...[-35, 0, 35].map((k, i) => G.path(`hook_${i}`, [
        { type: 'move', x: x + k, y: y + 6 },
        { type: 'quad', cx: x + k + 8, cy: y + 22, x: x + k - 2, y: y + 28 }
      ], { stroke: '#2a170b', lineWidth: 4, lineCap: 'round' }))
    ]);
  }
}
