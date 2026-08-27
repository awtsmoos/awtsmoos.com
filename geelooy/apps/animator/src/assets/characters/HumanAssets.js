// B"H
import { ShapeNodeFactory as S } from '../../shapes/ShapeNodeFactory.js';
/** Simple authored human marker for future rig replacement. */
export class HumanAssets {
  static marker(id, x, y, color = '#2f7ed8') { return S.group(id, [S.ellipse(`${id}_shadow`, { x, y: y + 50, radiusX: 34, radiusY: 9, fill: 'rgba(0,0,0,.25)' }), S.rect(`${id}_body`, { x: x - 24, y: y - 50, width: 48, height: 72, fill: color, stroke: '#111', lineWidth: 3 }), S.circle(`${id}_head`, { x, y: y - 82, radius: 24, fill: '#d99a72', stroke: '#111', lineWidth: 3 })]); }
}
