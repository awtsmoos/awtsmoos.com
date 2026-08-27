// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { TextWrapEngine } from './TextWrapEngine.js';

/**
 * @file SubtitlesRenderer.js
 * @description
 * Screen-safe subtitle cards for dialogue-heavy shots.
 */
export class SubtitlesRenderer {
  /**
   * Builds subtitle in actor plane near bottom but above dock.
   *
   * @param {Object} data - Character data.
   * @returns {Object|null} Subtitle node.
   */
  static build(data) {
    if (!data?.speech || !data?.isTalking) return null;
    const lines = TextWrapEngine.wrap(String(data.speech), 34);
    const w = 330;
    const h = Math.max(44, lines.length * 18 + 18);
    const x = -w * 0.5;
    const y = -370;

    return G.group(`subtitle_${data.id || 'speaker'}`, null, [
      this.roundRect('subtitle_body', x, y, w, h, 12, {
        fill: 'rgba(255,255,255,0.92)',
        stroke: '#050505',
        lineWidth: 2.4
      }),
      ...lines.map((line, i) => G.text(`subtitle_text_${i}`, line, 0, y + 18 + i * 18, {
        fill: '#050505',
        font: '900 14px system-ui, -apple-system, sans-serif',
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