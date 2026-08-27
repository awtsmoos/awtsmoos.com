// B"H
import { ShapeNodeFactory as S } from '../../shapes/ShapeNodeFactory.js';
/** Authored kitchen pieces: wall, table, shelf, window. */
export class KitchenAssets {
  static wall(w, h) { return S.group('kitchen_wall', [S.rect('wall_fill', { x: 0, y: 0, width: w, height: h, fill: '#f7dca8' }), S.rect('tile_band', { x: 0, y: h * .46, width: w, height: h * .18, fill: '#ffe8bf' })]); }
  static table(w, h) { const y = h * .62; return S.group('kitchen_table', [S.rect('table_face', { x: -20, y, width: w + 40, height: h * .18, fill: '#a76331' }), S.rect('table_top', { x: -20, y: y - 28, width: w + 40, height: 38, fill: '#cc8240' })]); }
  static window(w, h) { const x = w * .6, y = h * .11, ww = w * .28, hh = h * .16; return S.group('kitchen_window', [S.rect('window_frame', { x: x - 10, y: y - 10, width: ww + 20, height: hh + 20, fill: '#7b4a23' }), S.rect('window_sky', { x, y, width: ww, height: hh, fill: '#8fd7ff' }), S.circle('window_sun', { x: x + ww * .75, y: y + hh * .34, radius: 22, fill: '#ffe36c' })]); }
  static shelf(w, h) { const y = h * .29; return S.group('kitchen_shelf', [S.rect('shelf', { x: w * .08, y, width: w * .36, height: 12, fill: '#8f572c' }), S.rect('jar_red', { x: w * .12, y: y - 48, width: 34, height: 48, fill: '#d9443b' })]); }
}
