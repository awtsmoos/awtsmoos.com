// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file NoseRenderer.js
 * @description
 * Separate nose renderer for front/side/three-quarter.
 */
export class NoseRenderer {
  /**
   * Builds nose.
   *
   * @param {string} kind - Kind.
   * @param {Object} c - Palette.
   * @param {Object} m - Metrics.
   * @param {Object} view - View.
   * @returns {Object} Nose.
   */
  static build(kind, c, m, view) {
    const x = view.head.noseX;
    const y = m.headY + view.head.noseY;
    const d = view.dir;
    const reach = view.type === 'side' ? 12 : view.type === 'threeQuarter' ? 8 : 5;

    return G.path(`${kind}_nose`, [
      { type: 'move', x: x - d * 2, y: y - 6 },
      { type: 'quad', cx: x + reach * d, cy: y + 6, x: x + d * 1, y: y + 14 },
      { type: 'quad', cx: x - d * 5, cy: y + 13, x: x - d * 4, y: y + 8 }
    ], {
      stroke: 'rgba(0,0,0,0.42)',
      lineWidth: 2,
      lineCap: 'round',
      lineJoin: 'round'
    });
  }
}