// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableViewProfile } from './StableViewProfile.js';
import { StableFoot2D } from './StableFoot2D.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/** Limbs with visible idle/talk motion and articulated hands. */
export class StableLimbs2D {
  static legs(data, c, m, prefix, view) {
    const order = view.type === 'front' ? [-1, 1] : [view.limbs.farSide, view.limbs.nearSide];
    return S.group(`${prefix}_legs_connected`, null, order.map(side => this.leg(data, c, m, side, prefix, view)));
  }

  static backArm(data, c, m, prefix, view) { return this.arm(data, c, m, view.limbs.farSide, `${prefix}_back_arm_connected`, view.limbs.armFarAlpha, view); }
  static frontArm(data, c, m, prefix, view) { return this.arm(data, c, m, view.limbs.nearSide, `${prefix}_front_arm_connected`, 1, view); }

  static leg(data, c, m, side, prefix, view) {
    const pose = data._stablePose;
    const skeleton = data._skeleton;
    const leg = side < 0 ? pose.legs.left : pose.legs.right;
    const far = StableViewProfile.isFar(view, side);
    const hipBase = side < 0 ? skeleton.leftHip : skeleton.rightHip;
    const depth = far ? -view.limbs.legDepth : view.limbs.legDepth;
    const gaitX = view.limbs.gaitX;
    const compression = leg.planted ? 0.88 : 1;
    const stretch = leg.planted ? 1 : 1.08;
    const hip = { x: hipBase.x + depth + (leg.hipX || 0) * gaitX, y: hipBase.y + (leg.planted ? 2.2 : -1.2) };
    const knee = { x: hipBase.x + depth + leg.kneeX * gaitX, y: m.kneeY + leg.kneeY * compression };
    const ankle = { x: hipBase.x + depth + leg.ankleX * gaitX, y: m.ankleY + leg.ankleY * stretch };
    const foot = { x: hipBase.x + depth + leg.footX * gaitX, y: m.footY + leg.footY };
    const style = far ? LineArtStyle.far(data, c.pants) : LineArtStyle.outer(data, c.pants);
    return S.group(`${prefix}_leg_${side}`, null, [
      S.shadow(`${prefix}_foot_shadow_${side}`, foot.x, foot.y + 9, far ? 10 : 14, far ? 3 : 4, 0.18),
      S.tapered(`${prefix}_thigh_${side}`, hip, knee, (m.legWidth + 6) * (leg.planted ? 1.12 : .96), m.legWidth + 2, style),
      G.ellipse(`${prefix}_knee_cap_${side}`, knee.x, knee.y, far ? 3 : 4.5, far ? 2.3 : 3, 0, { fill: c.pantsDark || c.pants, stroke: 'rgba(0,0,0,.2)', lineWidth: 1 }),
      S.tapered(`${prefix}_shin_${side}`, knee, ankle, m.legWidth + 2, Math.max(5, m.legWidth - 2), style),
      StableFoot2D.build({ id: `${prefix}_foot_${side}`, x: foot.x, y: foot.y, side, c, view, leg, far })
    ]);
  }

  static arm(data, c, m, side, id, alpha, view) {
    const pose = data._stablePose;
    const skeleton = data._skeleton;
    const arm = side < 0 ? pose.arms.left : pose.arms.right;
    const far = StableViewProfile.isFar(view, side);
    const shoulder = side < 0 ? skeleton.leftShoulder : skeleton.rightShoulder;
    const sleeve = data.archetype === 'sage' ? c.robeLight : c.jacket;
    const style = far ? LineArtStyle.far(data, sleeve) : LineArtStyle.outer(data, sleeve);
    const sx = side < 0 ? -1 : 1;
    const time = Number(data._renderTime || 0);
    const talk = data.isTalking || data.speech || data.speaking;
    const gesture = String(data.gesture || data.renderPerformance?.body?.handPose || '');
    const pulse = Math.sin(time * 0.004 + side * 0.7);
    const breathe = Math.sin(time * 0.0018 + side) * 1.8;
    const perform = this.performanceOffset({ talk, gesture, pulse, side });
    const drag = Number(arm.handX || 0) * 0.12;
    const a = { x: shoulder.x, y: shoulder.y + 8 + (arm.shoulderLift || 0) + breathe + perform.shoulderY };
    const b = { x: a.x + sx * ((arm.elbowX || 14) - drag + perform.elbowX), y: a.y + (arm.elbowY || 38) + perform.elbowY };
    const hand = { x: b.x + sx * ((arm.handX || 10) + drag * .6 + perform.handX), y: b.y + (arm.handY || 30) + perform.handY };
    const shownStyle = { ...style, globalAlpha: alpha * (style.globalAlpha || 1) };
    return S.group(id, null, [
      G.ellipse(`${id}_shoulder_socket`, a.x, a.y, far ? 8 : 11, 9, 0, shownStyle),
      S.tapered(`${id}_upper`, a, b, far ? m.armWidth + 3 : m.armWidth + 8, far ? m.armWidth : m.armWidth + 3, shownStyle),
      S.tapered(`${id}_fore`, b, hand, far ? m.armWidth : m.armWidth + 3, far ? m.armWidth - 2 : m.armWidth, shownStyle),
      G.ellipse(`${id}_elbow_soft_cover`, b.x, b.y, far ? 3.2 : 4.5, far ? 2.5 : 3.2, 0, { fill: sleeve, stroke: 'rgba(0,0,0,.2)', lineWidth: far ? .8 : 1 }),
      this.cuff(`${id}_cuff`, hand, sx, sleeve, c),
      S.hand(`${id}_hand`, hand.x, hand.y + 2, sx, c, perform.handPose)
    ]);
  }

  static performanceOffset({ talk, gesture, pulse, side }) {
    const explain = /explain|talk|open/.test(gesture) || talk;
    const point = /point/.test(gesture);
    const raise = /celebrate|wave|raise/.test(gesture);
    if (point && side > 0) return { elbowX: 18, elbowY: -19, handX: 23, handY: -34, shoulderY: -2, handPose: 'point' };
    if (raise && side > 0) return { elbowX: 7, elbowY: -42, handX: 5 + pulse * 5, handY: -47, shoulderY: -4, handPose: 'open' };
    if (explain && side > 0) return { elbowX: 11 + pulse * 5, elbowY: -15 + pulse * 2, handX: 14 + pulse * 8, handY: -30 + Math.cos(pulse) * 3, shoulderY: -1, handPose: 'open' };
    return { elbowX: pulse * 1.8, elbowY: pulse * 1.2, handX: pulse * 2.4, handY: Math.cos(pulse) * 1.6, shoulderY: 0, handPose: 'relaxed' };
  }

  static cuff(id, hand, sx, sleeve, c) {
    return G.ellipse(id, hand.x - sx * 5, hand.y + 1, 5.5, 3.2, sx * 0.2, { fill: sleeve, stroke: c.line, lineWidth: 1 });
  }
}
