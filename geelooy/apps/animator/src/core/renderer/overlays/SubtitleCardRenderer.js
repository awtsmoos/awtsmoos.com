// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file SubtitleCardRenderer.js
 * @description
 * Draws readable screen-space subtitle card.
 */
export class SubtitleCardRenderer {
  /**
   * Builds subtitle card.
   *
   * @param {Object} layout - Layout.
   * @returns {Object} Node.
   */
  static build(layout) {
    return G.group('screen_subtitle_card', null, [
      this.roundRect('subtitle_card_body', layout.x, layout.y, layout.w, layout.h, 14, {
        fill: 'rgba(255,255,255,0.94)',
        stroke: '#050505',
        lineWidth: 3
      }),
      ...layout.lines.map((line, i) => G.text(`subtitle_card_text_${i}`, line, layout.x + layout.w * 0.5, layout.y + 23 + i * 19, {
        fill: '#050505',
        font: '900 15px system-ui, -apple-system, sans-serif',
        textAlign: 'center',
        align: 'center',
        textBaseline: 'middle'
      }))
    ]);
  }

  /**
   * Rounded rectangle.
   *
   * @param {string} id - Id.
   * @param {number} x - X.
   * @param {number} y - Y.
   * @param {number} w - Width.
   * @param {number} h - Height.
   * @param {number} r - Radius.
   * @param {Object} style - Style.
   * @returns {Object} Path.
   */
  static roundRect(id, x, y, w, h, r, style) {
    return G.path(id, [
      { type: 'move', x: x + r, y },
      { type: 'line', x: x + w - r, y },
      { type: 'quad', cx: x + w, cy: y, x: x + w, y: y + r },
      { type: 'line', x: x + w, y: y + h - r },
      { type: 'quad', cx: x + w, cy: y + h, x: x + w - r, y: y + h },
      { type: 'line', x: x + r, y: y + h },
      { type: 'quad', cx: x, cy: y + h, x, y: y + h - r },
      { type: 'line', x, y: y + r },
      { type: 'quad', cx: x, cy: y, x: x + r, y }
    ], style);
  }
}