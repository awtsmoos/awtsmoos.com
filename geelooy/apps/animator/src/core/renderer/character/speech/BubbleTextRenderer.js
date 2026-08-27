// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file BubbleTextRenderer.js
 * @description
 * Draws wrapped bubble text.
 */
export class BubbleTextRenderer {
  /**
   * Builds text nodes.
   *
   * @param {Array<string>} lines - Lines.
   * @param {Object} rect - Rect.
   * @param {number} scale - Scale.
   * @returns {Array<Object>} Nodes.
   */
  static build(lines, rect, scale) {
    const size = Math.max(11, 15 * scale);
    const lineHeight = size * 1.23;
    const top = rect.y + 17 * scale;
    return lines.map((line, i) => G.text(`bubble_text_${i}`, line, rect.x + rect.w * 0.5, top + i * lineHeight, {
      fill: '#050505',
      font: `900 ${size}px system-ui, -apple-system, sans-serif`,
      align: 'center',
      textAlign: 'center',
      textBaseline: 'middle'
    }));
  }
}