// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file BubbleTailRenderer.js
 * @description
 * Draws a short tail that avoids spearing the face.
 */
export class BubbleTailRenderer {
  /**
   * Builds tail.
   *
   * @param {Object} rect - Bubble rect.
   * @param {Object} tail - Tail target.
   * @returns {Object} Tail path.
   */
  static build(rect, tail) {
    const baseX = Math.max(rect.x + 30, Math.min(rect.x + rect.w - 30, tail.x));
    const baseY = rect.y + rect.h - 2;
    const tipY = Math.min(baseY + 42, tail.y);
    return G.path('bubble_tail_safe', [
      { type: 'move', x: baseX - 13, y: baseY },
      { type: 'line', x: baseX, y: tipY },
      { type: 'line', x: baseX + 13, y: baseY },
      { type: 'line', x: baseX - 13, y: baseY }
    ], {
      fill: '#ffffff',
      stroke: '#050505',
      lineWidth: 4,
      lineJoin: 'round'
    });
  }
}