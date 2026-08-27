
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class BookProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    
    return G.group(propData.id, transform, [
      G.rect('book_cover', -25*s, -20*s, 50*s, 40*s, { fill: propData.color || '#8b4513', stroke: '#000', lineWidth: 4*s }),
      G.rect('book_pages', -20*s, -15*s, 40*s, 30*s, { fill: '#f4e4bc' }),
      G.text('book_text', 'א', 0, 0, { fill: '#000', font: `900 ${24*s}px sans-serif`, align: 'center' })
    ]);
  }
}
