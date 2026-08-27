// B"H
import { ShapeNodeFactory as S } from '../../shapes/ShapeNodeFactory.js';
/** Hand-authored food assets; no random cooking smoke. */
export class FoodAssets {
  static apple(id, x, y) { return S.group(id, [S.circle(`${id}_body`, { x, y, radius: 20, fill: '#df3e35', stroke: '#4b120f', lineWidth: 3 }), S.rect(`${id}_stem`, { x: x - 2, y: y - 30, width: 5, height: 12, fill: '#70451e' })]); }
  static carrot(id, x, y) { return S.group(id, [S.path(`${id}_body`, [{ type: 'move', x: x - 28, y: y - 10 }, { type: 'line', x: x + 34, y }, { type: 'line', x: x - 28, y: y + 10 }, { type: 'line', x: x - 28, y: y - 10 }], { fill: '#f28c28', stroke: '#5e2a0d', lineWidth: 3 }), S.rect(`${id}_leaf`, { x: x - 42, y: y - 12, width: 14, height: 24, fill: '#389447' })]); }
  static sandwich(id, x, y) { return S.group(id, [S.rect(`${id}_bread`, { x: x - 32, y: y - 16, width: 64, height: 32, fill: '#f0c36a', stroke: '#5d3518', lineWidth: 2 }), S.rect(`${id}_leaf`, { x: x - 26, y: y - 2, width: 52, height: 8, fill: '#76b852' })]); }
  static plate(id, x, y) { return S.group(id, [S.ellipse(`${id}_outer`, { x, y, radiusX: 92, radiusY: 28, fill: '#fbfdff', stroke: '#8aa', lineWidth: 2 }), S.ellipse(`${id}_inner`, { x, y, radiusX: 58, radiusY: 14, fill: '#e7f3ff', stroke: '#9ab', lineWidth: 1 })]); }
}
