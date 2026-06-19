// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * @file StableHair2D.js
 * @description
 * ============================================================================
 * CHAPTER: VIEW-AWARE HAIR THAT STAYS ABOVE THE EYES
 * ============================================================================
 *
 * Hair receives the same view plan as face and body. Bangs are clamped above
 * the eye zone so hair stops covering the face.
 *
 * @class StableHair2D
 */
export class StableHair2D {
  /**
   * Back hair mass.
   *
   * @param {Object} data - Data.
   * @param {Object} c - Palette.
   * @param {Object} m - Metrics.
   * @param {number} time - Time.
   * @param {Object} view - View.
   * @returns {Object} Node.
   */
  static back(data, c, m, time, view) {
    const sideStretch = view.type === 'side' ? 0.8 : view.type === 'threeQuarter' ? 0.92 : 1;
    return S.group('hair_back', null, [
      G.ellipse('hair_back_mass', view.head.offsetX * 0.5, m.headY - 4, (m.headRX + 6) * sideStretch, m.headRY + 7, 0, {
        fill: c.hairDark,
        stroke: c.line,
        lineWidth: 3
      }),
      ...this.sideLocks(c, m, view)
    ]);
  }

  /**
   * Front hair.
   *
   * @param {Object} data - Data.
   * @param {Object} c - Palette.
   * @param {Object} m - Metrics.
   * @param {number} time - Time.
   * @param {Object} view - View.
   * @returns {Object} Node.
   */
  static front(data, c, m, time, view) {
    const locks = this.lockAnchors(data, view);
    const safeBottom = m.headY - 17;

    return S.group('hair_front_safe', null, [
      G.path('hairline_safe', [
        { type: 'move', x: -m.headRX * 0.72 + view.head.offsetX * 0.25, y: m.headY - 32 },
        { type: 'quad', cx: view.head.offsetX * 0.25, cy: m.headY - 43, x: m.headRX * 0.72 + view.head.offsetX * 0.25, y: m.headY - 32 }
      ], {
        stroke: c.hair,
        lineWidth: 8,
        lineCap: 'round'
      }),
      ...locks.map((x, i) => {
        const sway = Math.sin(time * 0.0018 + i) * 0.6;
        const endY = Math.min(safeBottom, m.headY - 31 + 8 + (i % 3) * 3);
        return G.path(`hair_lock_${i}`, [
          { type: 'move', x, y: m.headY - 36 },
          { type: 'quad', cx: x + sway + view.dir * 1.5, cy: m.headY - 28, x: x + view.dir * 1.2, y: endY }
        ], {
          stroke: c.hair,
          lineWidth: 6,
          lineCap: 'round'
        });
      })
    ]);
  }

  /**
   * Side locks.
   *
   * @param {Object} c - Palette.
   * @param {Object} m - Metrics.
   * @param {Object} view - View.
   * @returns {Array<Object>} Nodes.
   */
  static sideLocks(c, m, view) {
    if (view.type === 'side') {
      const d = view.dir;
      return [
        G.path('hair_side_profile_near', [
          { type: 'move', x: d * 25, y: m.headY - 24 },
          { type: 'quad', cx: d * 40, cy: m.headY + 8, x: d * 17, y: m.headY + 46 }
        ], { stroke: c.hairDark, lineWidth: 9, lineCap: 'round' }),
        G.path('hair_side_profile_back', [
          { type: 'move', x: -d * 25, y: m.headY - 24 },
          { type: 'quad', cx: -d * 35, cy: m.headY + 13, x: -d * 16, y: m.headY + 44 }
        ], { stroke: c.hairDark, lineWidth: 7, lineCap: 'round' })
      ];
    }

    return [
      G.path('hair_side_locks', [
        { type: 'move', x: -m.headRX, y: m.headY - 8 },
        { type: 'quad', cx: -m.headRX - 8, cy: m.headY + 30, x: -18, y: m.headY + 48 },
        { type: 'move', x: m.headRX, y: m.headY - 8 },
        { type: 'quad', cx: m.headRX + 8, cy: m.headY + 30, x: 18, y: m.headY + 48 }
      ], {
        stroke: c.hairDark,
        lineWidth: 6,
        lineCap: 'round'
      })
    ];
  }

  /**
   * Lock anchors.
   *
   * @param {Object} data - Data.
   * @param {Object} view - View.
   * @returns {Array<number>} Anchors.
   */
  static lockAnchors(data, view) {
    const base = data.archetype === 'sage'
      ? [-14, 0, 14]
      : [-20, -9, 3, 15];

    if (view.type === 'side') {
      return [view.dir * 2, view.dir * 12, view.dir * 22];
    }

    if (view.type === 'threeQuarter') {
      return base.map(x => x + view.dir * 4);
    }

    return base;
  }
}