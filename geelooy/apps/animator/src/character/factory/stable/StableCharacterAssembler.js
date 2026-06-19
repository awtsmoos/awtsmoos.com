// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableRigMetrics } from './StableRigMetrics.js';
import { StablePalette } from './StablePalette.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableViewProfile } from './StableViewProfile.js';
import { StableWholeBodyPose } from './StableWholeBodyPose.js';
import { StableHair2D } from './StableHair2D.js';
import { StableBody2D } from './StableBody2D.js';
import { StableLimbs2D } from './StableLimbs2D.js';
import { StableFace2D } from './StableFace2D.js';
import { SkeletonFactory } from '../../rig/SkeletonFactory.js';
import { StableAccessories2D } from './StableAccessories2D.js';

/** Connected character assembler with visible performance consumption. */
export class StableCharacterAssembler {
  static assemble(data) {
    if (!data) return null;
    const sage = data.archetype === 'sage' || data.style === 'illustrated_sage';
    const m = sage ? StableRigMetrics.sage() : StableRigMetrics.human();
    const c = sage ? StablePalette.sage(data) : StablePalette.human(data);
    const view = StableViewProfile.get(data);
    const time = S.num(data._renderTime, 0);
    const pose = StableWholeBodyPose.get(data, view, time);
    const skeleton = SkeletonFactory.create(data, m, view, pose);
    const renderData = { ...data, _stableView: view, _stablePose: pose, _skeleton: skeleton };
    const pos = this.position(renderData, sage);
    const prefix = sage ? 'sage' : 'human';
    const body = pose.body || {};
    const breath = S.clamp(body.torsoBreathScale || 1, 0.96, 1.05);

    return S.group(`stable_character_${renderData.id || 'soul'}`, pos, [
      G.ellipse(`${prefix}_shadow`, 0, m.footY + 7, m.shadowRX, m.shadowRY, 0, { fill: 'rgba(0,0,0,0.24)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 }),
      S.group(`${prefix}_connected_body_axis`, {
        x: (body.hipX || 0) * 0.08,
        y: S.clamp(body.bob || 0, -13, 8),
        scaleY: breath,
        rotation: (body.torsoLean || 0) * 0.006
      }, [
        StableHair2D.back(renderData, c, m, time, view),
        StableLimbs2D.legs(renderData, c, m, prefix, view),
        StableLimbs2D.backArm(renderData, c, m, prefix, view),
        sage ? StableBody2D.sage(renderData, c, m, view) : StableBody2D.human(renderData, c, m, view),
        S.group(`${prefix}_head_axis`, {
          x: skeleton.head.x * 0.05,
          y: Number(body.headNod || 0) + Number(renderData.renderPerformance?.body?.headOffsetY || 0) * 0.45,
          rotation: Number(body.headRotation || 0)
        }, [
          sage ? StableFace2D.sage(renderData, c, m, view) : StableFace2D.human(renderData, c, m, view),
          StableHair2D.front(renderData, c, m, time, view),
          StableAccessories2D.build(renderData, c, m, view)
        ]),
        StableLimbs2D.frontArm(renderData, c, m, prefix, view)
      ])
    ]);
  }

  static position(data, sage) {
    const p = data.position || {};
    const scale = S.clamp(Math.abs(S.num(p.scale ?? data.scale, sage ? 0.82 : 0.86)), 0.24, 2.4);
    return { x: S.num(p.x ?? data.x, 0), y: S.num(p.y ?? data.y, 0), scaleX: scale, scaleY: scale, rotation: 0 };
  }
}
