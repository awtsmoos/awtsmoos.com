// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class BookPropRenderer {
  static build(p = {}) {
    const s = p.size || 34;
    return G.group('prod_book', null, [
      G.rect('book_shadow', { x: -s * 0.9, y: s * 0.45, width: s * 1.8, height: 6, fill: 'rgba(0,0,0,.18)' }),
      G.rect('book_cover', { x: -s, y: -s * 0.45, width: s * 2, height: s * 0.9, fill: p.color || '#1c2c4a', stroke: '#120b06', lineWidth: 2.8 }),
      G.rect('book_spine', { x: -s, y: -s * 0.45, width: s * 0.22, height: s * 0.9, fill: 'rgba(0,0,0,.22)' }),
      G.text('book_title', 'ספר', -s * 0.18, 4, { font: `bold ${Math.max(12, s * 0.34)}px sans-serif`, fill: '#d9b35d' }),
      G.rect('book_highlight', { x: -s * 0.72, y: -s * 0.28, width: s * 1.3, height: 3, fill: 'rgba(255,255,255,.16)' })
    ]);
  }
}
