// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { EyeRenderer } from './EyeRenderer.js';
import { NoseRenderer } from './NoseRenderer.js';
import { MouthRenderer } from './MouthRenderer.js';
import { FaceFrontRenderer } from './FaceFrontRenderer.js';

/**
 * @file FaceThreeQuarterRenderer.js
 * @description
 * Chapter: The closeup turned from icon into performance.
 * Three-quarter faces no longer reuse flat front geometry. The near cheek,
 * far cheek, ear placement, nose bridge, and eye spacing now create a cinematic
 * head with emotional asymmetry and readable gaze.
 */
export class FaceThreeQuarterRenderer {
  /**
   * Builds a three-quarter face.
   *
   * @param {string} kind - Kind.
   * @param {Object} data - Character data.
   * @param {Object} c - Palette.
   * @param {Object} m - Metrics.
   * @param {Object} view - View profile.
   * @param {boolean} beard - Beard flag.
   * @returns {Object} Face node.
   */
  static build(kind, data, c, m, view, beard) {
    const mood = FaceFrontRenderer.mood(data);
    const blink = FaceFrontRenderer.blink(data);
    const dir = view.dir || 1;

    return S.group(`${kind}_face_three_quarter`, {
      x: view.head.offsetX,
      scaleX: view.head.scaleX
    }, [
      G.ellipse(`${kind}_far_ear`, -dir * m.headRX * 0.92, m.headY + 1, 5.8, 10.5, 0, {
        fill: c.skinDark,
        stroke: c.line,
        lineWidth: 1.8
      }),
      G.ellipse(`${kind}_head`, 0, m.headY, m.headRX, m.headRY, dir * -2, {
        fill: c.skin,
        stroke: c.line,
        lineWidth: 4
      }),
      G.ellipse(`${kind}_near_cheek_plane`, dir * 13, m.headY + 9, 14, 20, dir * -9, {
        fill: 'rgba(255,255,255,0.08)',
        stroke: 'rgba(0,0,0,0)',
        lineWidth: 0
      }),
      G.ellipse(`${kind}_near_ear`, dir * m.headRX * 0.98, m.headY + 1, 7.2, 12, 0, {
        fill: c.skinDark,
        stroke: c.line,
        lineWidth: 2.1
      }),
      ...EyeRenderer.build(kind, c, m, view, mood, blink, data),
      ...this.brows(kind, c, m, view, mood),
      NoseRenderer.build(kind, c, m, view),
      this.cheeks(kind, c, m, dir),
      MouthRenderer.build(kind, data, c, m, view, mood),
      beard ? FaceFrontRenderer.beard(kind, c, m, view) : null
    ]);
  }

  /** @param {string} kind @param {Object} c @param {Object} m @param {Object} view @param {Object} mood @returns {Array<Object>} */
  static brows(kind, c, m, view, mood) {
    return [-1, 1].map((side) => {
      const near = side === view.dir;
      const x = side * view.head.eyeSpread + view.dir * (near ? 3 : 5);
      const tilt = (mood.brow || 0) * (near ? 0.32 : 0.18);
      return G.path(`${kind}_brow_${side}`, [
        { type: 'move', x: x - side * 7.6, y: m.headY - 25 + side * tilt },
        { type: 'line', x: x + side * 7.6, y: m.headY - 27 - side * tilt }
      ], {
        stroke: c.line,
        lineWidth: near ? 3.4 : 2.6,
        lineCap: 'round'
      });
    });
  }

  /** @param {string} kind @param {Object} c @param {Object} m @param {number} dir @returns {Object} */
  static cheeks(kind, c, m, dir) {
    return S.group(`${kind}_cheeks`, null, [
      G.ellipse(`${kind}_cheek_near`, dir * 18, m.headY + 10, 6.4, 4.2, 0, {
        fill: c.blush,
        stroke: 'rgba(0,0,0,0)',
        lineWidth: 0
      }),
      G.ellipse(`${kind}_cheek_far`, -dir * 13, m.headY + 11, 3.6, 2.8, 0, {
        fill: c.blush,
        stroke: 'rgba(0,0,0,0)',
        lineWidth: 0
      })
    ]);
  }
}
