// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * @file FootRenderer.js
 * @description
 * Big readable feet for proving planted/swinging gait.
 */
export class FootRenderer {
  /**
   * Builds foot.
   *
   * @param {Object} spec - Foot spec.
   * @returns {Object} Foot graph.
   */
  static build(spec) {
    const { id, x, y, side, c, view, leg, far } = spec;
    const dir = side < 0 ? -1 : 1;
    const planted = leg.planted === true;
    const lift = planted ? 0 : -5;
    const tilt = (leg.footTilt || 0) + (far ? view.feet.farAngle : view.feet.nearAngle);
    const w = (planted ? 34 : 29) * (far ? 0.86 : 1);
    const h = (planted ? 10 : 9) * (far ? 0.88 : 1);
    const toe = dir * w * 0.5;
    const heel = -dir * w * 0.38;

    return S.group(id, { x, y: y + lift, rotation: tilt }, [
      G.ellipse(`${id}_contact_shadow`, 0, planted ? 9 : 13, planted ? w * 0.82 : w * 0.42, planted ? 3.8 : 2.2, 0, {
        fill: planted ? 'rgba(0,0,0,0.31)' : 'rgba(0,0,0,0.15)',
        stroke: 'rgba(0,0,0,0)',
        lineWidth: 0
      }),
      G.path(`${id}_shoe`, [
        { type: 'move', x: heel, y: -h * 0.55 },
        { type: 'quad', cx: 0, cy: -h * 1.35, x: toe, y: -h * 0.52 },
        { type: 'quad', cx: toe + dir * 9, cy: 0, x: toe, y: h * 0.72 },
        { type: 'quad', cx: 0, cy: h * 1.15, x: heel, y: h * 0.52 },
        { type: 'quad', cx: heel - dir * 5, cy: 0, x: heel, y: -h * 0.55 }
      ], {
        fill: c.shoe || '#050507',
        stroke: c.line || '#060606',
        lineWidth: far ? 2 : 3,
        lineJoin: 'round'
      }),
      G.path(`${id}_toe_highlight`, [
        { type: 'move', x: -dir * 2, y: -2 },
        { type: 'quad', cx: dir * 8, cy: -4, x: toe - dir * 5, y: 1 }
      ], {
        stroke: 'rgba(255,255,255,0.19)',
        lineWidth: 1.3,
        lineCap: 'round'
      })
    ]);
  }
}