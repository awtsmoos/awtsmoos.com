// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { EyeRenderer } from './EyeRenderer.js';
import { NoseRenderer } from './NoseRenderer.js';
import { MouthRenderer } from './MouthRenderer.js';
import { FaceFrontRenderer } from './FaceFrontRenderer.js';

/**
 * @file FaceSideRenderer.js
 * @description
 * Chapter: The profile stopped being a cutout.
 * Side faces now have skull mass, cheek plane, ear depth, jaw rhythm, gaze, and
 * mouth perspective so walk shots feel staged and closeups still carry acting.
 */
export class FaceSideRenderer {
  /**
   * Builds a side profile face.
   *
   * @param {string} kind - Kind.
   * @param {Object} data - Data.
   * @param {Object} c - Palette.
   * @param {Object} m - Metrics.
   * @param {Object} view - View.
   * @param {boolean} beard - Beard.
   * @returns {Object} Node.
   */
  static build(kind, data, c, m, view, beard) {
    const d = view.dir;
    const mood = FaceFrontRenderer.mood(data);
    const blink = FaceFrontRenderer.blink(data);

    return S.group(`${kind}_face_side`, {
      x: view.head.offsetX,
      scaleX: view.head.scaleX
    }, [
      G.ellipse(`${kind}_ear_back`, -d * 26, m.headY + 1, 7, 12, 0, {
        fill: c.skinDark,
        stroke: c.line,
        lineWidth: 2
      }),
      G.path(`${kind}_head_side`, [
        { type: 'move', x: -d * 23, y: m.headY - 37 },
        { type: 'quad', cx: d * 18, cy: m.headY - 47, x: d * 31, y: m.headY - 16 },
        { type: 'quad', cx: d * 45, cy: m.headY - 6, x: d * 31, y: m.headY + 5 },
        { type: 'quad', cx: d * 44, cy: m.headY + 18, x: d * 18, y: m.headY + 30 },
        { type: 'quad', cx: d * 0, cy: m.headY + 45, x: -d * 25, y: m.headY + 29 },
        { type: 'quad', cx: -d * 39, cy: m.headY - 7, x: -d * 23, y: m.headY - 37 }
      ], {
        fill: c.skin,
        stroke: c.line,
        lineWidth: 4,
        lineJoin: 'round'
      }),
      G.path(`${kind}_cheek_jaw_plane`, [
        { type: 'move', x: d * 10, y: m.headY + 5 },
        { type: 'quad', cx: d * 20, cy: m.headY + 18, x: d * 7, y: m.headY + 31 }
      ], {
        stroke: 'rgba(0,0,0,0.13)',
        lineWidth: 1.7,
        lineCap: 'round'
      }),
      ...EyeRenderer.build(kind, c, m, view, mood, blink, data),
      this.brow(kind, c, m, view, mood),
      NoseRenderer.build(kind, c, m, view),
      MouthRenderer.build(kind, data, c, m, view, mood),
      beard ? FaceFrontRenderer.beard(kind, c, m, view) : null
    ]);
  }

  /** @param {string} kind @param {Object} c @param {Object} m @param {Object} view @param {Object} mood @returns {Object} */
  static brow(kind, c, m, view, mood) {
    const d = view.dir;
    return G.path(`${kind}_profile_brow`, [
      { type: 'move', x: d * 5, y: m.headY - 26 + mood.brow * 0.18 },
      { type: 'line', x: d * 20, y: m.headY - 28 - mood.brow * 0.24 }
    ], {
      stroke: c.line,
      lineWidth: 3.2,
      lineCap: 'round'
    });
  }
}
