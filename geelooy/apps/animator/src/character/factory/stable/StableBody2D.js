// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/** Torso/clothing renderer with folds, seams, collar, cuffs, and fabric life. */
export class StableBody2D {
  static human(data, c, m, view) {
    return S.group('human_body_connected', null, [
      this.neck(data, c, m), this.torso(data, c, m), this.lapels(data, c, m),
      this.fabric(data, c, m), this.pelvis(data, c, m), this.collar(data, c, m)
    ]);
  }

  static sage(data, c, m, view) {
    return S.group('sage_body_connected', null, [
      this.neck(data, c, m), this.robe(data, c, m), this.robeFolds(data, c, m), this.collar(data, c, m)
    ]);
  }

  static neck(data, c, m) {
    const s = data._skeleton;
    return S.poly('neck_connected', [[s.neck.x - 7, m.neckBottomY], [s.neck.x + 7, m.neckBottomY], [s.neck.x + 6, m.neckTopY], [s.neck.x - 6, m.neckTopY]], LineArtStyle.outer(data, c.skin));
  }

  static torso(data, c, m) {
    const s = data._skeleton;
    return G.path('jacket_connected_mass', [
      { type: 'move', x: s.leftShoulder.x, y: m.shoulderY },
      { type: 'quad', cx: s.chest.x, cy: m.shoulderY - 12, x: s.rightShoulder.x, y: m.shoulderY },
      { type: 'line', x: s.rightHip.x + 18, y: m.hipY + 3 },
      { type: 'quad', cx: s.hips.x, cy: m.hipY + 17, x: s.leftHip.x - 18, y: m.hipY + 3 },
      { type: 'line', x: s.leftShoulder.x, y: m.shoulderY }
    ], LineArtStyle.outer(data, c.jacket));
  }

  static robe(data, c, m) {
    const s = data._skeleton;
    return G.path('robe_connected_mass', [
      { type: 'move', x: s.leftShoulder.x - 4, y: m.shoulderY },
      { type: 'quad', cx: s.chest.x, cy: m.shoulderY - 10, x: s.rightShoulder.x + 4, y: m.shoulderY },
      { type: 'line', x: s.rightHip.x + 28, y: m.robeBottomY },
      { type: 'quad', cx: s.hips.x, cy: m.robeBottomY + 18, x: s.leftHip.x - 28, y: m.robeBottomY },
      { type: 'line', x: s.leftShoulder.x - 4, y: m.shoulderY }
    ], LineArtStyle.outer(data, c.robe));
  }

  static lapels(data, c, m) {
    const s = data._skeleton;
    return S.group('soft_lapels', null, [
      G.path('lapel_left_soft', [{ type: 'move', x: s.leftShoulder.x + 9, y: m.shoulderY + 5 }, { type: 'line', x: s.chest.x - 5, y: m.chestY + 18 }, { type: 'line', x: s.chest.x - 14, y: m.waistY - 6 }], LineArtStyle.inner(data, c.jacketDark)),
      G.path('lapel_right_soft', [{ type: 'move', x: s.rightShoulder.x - 9, y: m.shoulderY + 5 }, { type: 'line', x: s.chest.x + 5, y: m.chestY + 18 }, { type: 'line', x: s.chest.x + 14, y: m.waistY - 6 }], LineArtStyle.inner(data, c.jacketLight)),
      G.path('shirt_center_fold', [{ type: 'move', x: s.chest.x, y: m.chestY + 13 }, { type: 'line', x: s.chest.x, y: m.waistY + 4 }], { stroke: 'rgba(255,255,255,.45)', lineWidth: 1.2 }),
      ...[28, 44, 60].map((dy, i) => G.circle(`button_${i}_soft`, s.chest.x, m.chestY + dy, 2.1, { fill: c.line, stroke: c.line, lineWidth: 0 }))
    ]);
  }

  static fabric(data, c, m) {
    const s = data._skeleton;
    const t = Number(data._renderTime || 0);
    const sway = Math.sin(t * 0.002) * 1.5;
    const lines = [-18, -9, 10, 20].map((x, i) => G.path(`jacket_fold_${i}`, [
      { type: 'move', x: s.chest.x + x, y: m.chestY + 29 },
      { type: 'quad', cx: s.chest.x + x * 0.8 + sway, cy: m.waistY - 3, x: s.chest.x + x * 0.45, y: m.hipY + 1 }
    ], { stroke: i % 2 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.18)', lineWidth: 1.15, lineCap: 'round' }));
    return S.group('fabric_folds', null, [
      ...lines,
      G.path('left_pocket_slash', [{ type: 'move', x: s.leftHip.x - 8, y: m.waistY + 8 }, { type: 'line', x: s.leftHip.x + 12, y: m.waistY + 2 }], { stroke: 'rgba(0,0,0,.28)', lineWidth: 1.4, lineCap: 'round' }),
      G.path('right_pocket_slash', [{ type: 'move', x: s.rightHip.x + 8, y: m.waistY + 8 }, { type: 'line', x: s.rightHip.x - 12, y: m.waistY + 2 }], { stroke: 'rgba(0,0,0,.28)', lineWidth: 1.4, lineCap: 'round' })
    ]);
  }

  static robeFolds(data, c, m) {
    const s = data._skeleton;
    return S.group('robe_folds', null, [-22, -10, 7, 19].map((x, i) => G.path(`robe_fold_${i}`, [{ type: 'move', x: s.chest.x + x, y: m.chestY + 15 }, { type: 'quad', cx: s.chest.x + x * .6, cy: m.waistY + 26, x: s.chest.x + x * .9, y: m.robeBottomY - 8 }], { stroke: 'rgba(0,0,0,.18)', lineWidth: 1.2, lineCap: 'round' })));
  }

  static pelvis(data, c, m) {
    const s = data._skeleton;
    return S.group('pelvis_layer', null, [
      G.path('pelvis_connected', [{ type: 'move', x: s.leftHip.x - 16, y: m.hipY - 9 }, { type: 'quad', cx: s.hips.x, cy: m.hipY - 18, x: s.rightHip.x + 16, y: m.hipY - 9 }, { type: 'line', x: s.rightHip.x + 9, y: m.hipY + 16 }, { type: 'quad', cx: s.hips.x, cy: m.hipY + 25, x: s.leftHip.x - 9, y: m.hipY + 16 }, { type: 'line', x: s.leftHip.x - 16, y: m.hipY - 9 }], LineArtStyle.outer(data, c.pants)),
      G.path('waist_seam', [{ type: 'move', x: s.leftHip.x - 18, y: m.hipY - 7 }, { type: 'quad', cx: s.hips.x, cy: m.hipY - 2, x: s.rightHip.x + 18, y: m.hipY - 7 }], { stroke: 'rgba(0,0,0,.32)', lineWidth: 1.4, lineCap: 'round' })
    ]);
  }

  static collar(data, c, m) {
    const s = data._skeleton;
    return S.group('collar_connected', null, [
      S.poly('collar_left', [[s.neck.x - 24, m.shoulderY + 4], [s.neck.x - 4, m.neckBottomY + 5], [s.neck.x - 14, m.chestY + 16]], LineArtStyle.outer(data, c.collar)),
      S.poly('collar_right', [[s.neck.x + 24, m.shoulderY + 4], [s.neck.x + 4, m.neckBottomY + 5], [s.neck.x + 14, m.chestY + 16]], LineArtStyle.outer(data, c.collar)),
      G.path('collar_inner_shadow', [{ type: 'move', x: s.neck.x - 11, y: m.neckBottomY + 5 }, { type: 'quad', cx: s.neck.x, cy: m.neckBottomY + 14, x: s.neck.x + 11, y: m.neckBottomY + 5 }], { stroke: 'rgba(0,0,0,.22)', lineWidth: 1.2, lineCap: 'round' })
    ]);
  }
}
