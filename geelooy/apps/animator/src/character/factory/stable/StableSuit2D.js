// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class StableSuit2D {
  static overlay(data = {}, c = {}, m = {}) {
    if (!(data.archetype === 'sage' || data.style === 'goal_board_sage')) return null;
    const top = Number.isFinite(Number(m.torsoTop)) ? Number(m.torsoTop) : 18;
    const line = c.line || '#111111';
    const shirt = data.colors?.shirt || '#fff4df';
    return G.group('stable_suit_overlay', null, [
      G.path('left_lapel', [
        { type: 'move', x: -18, y: top + 8 }, { type: 'line', x: -4, y: top + 50 }, { type: 'line', x: -28, y: top + 18 }
      ], { fill: shirt, stroke: line, lineWidth: 2 }),
      G.path('right_lapel', [
        { type: 'move', x: 18, y: top + 8 }, { type: 'line', x: 4, y: top + 50 }, { type: 'line', x: 28, y: top + 18 }
      ], { fill: shirt, stroke: line, lineWidth: 2 }),
      G.rect('vest_center', { x: -9, y: top + 48, width: 18, height: 55, fill: 'rgba(0,0,0,.18)' }),
      ...[-1, 0, 1].map((_, i) => G.circle(`vest_button_${i}`, { x: 0, y: top + 58 + i * 18, radius: 2.4, fill: line }))
    ]);
  }
}
