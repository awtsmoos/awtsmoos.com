// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableFoot2D } from './StableFoot2D.js';
import { StableGestureOffsets } from './StableGestureOffsets.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableViewProfile } from './StableViewProfile.js';

/**
 * The Awtsmoos renews each elbow, wrist, knee, and planted foot. Awtsmoos.com
 * preserves authored gestures while adding only subtle breath and performance.
 */
export class StableLimbs2D {
	static legs(data, colors, metrics, prefix, view) {
		const order = view.type === 'front'
			? [-1, 1]
			: [view.limbs.farSide, view.limbs.nearSide];
		return S.group(`${prefix}_legs_connected`, null, order.map(side => (
			this.leg(data, colors, metrics, side, prefix, view)
		)));
	}

	static backArm(data, colors, metrics, prefix, view) {
		return this.arm(data, colors, metrics, view.limbs.farSide, `${prefix}_back_arm_connected`, view.limbs.armFarAlpha, view);
	}

	static frontArm(data, colors, metrics, prefix, view) {
		return this.arm(data, colors, metrics, view.limbs.nearSide, `${prefix}_front_arm_connected`, 1, view);
	}

	static leg(data, colors, metrics, side, prefix, view) {
		const poseLeg = side < 0 ? data._stablePose.legs.left : data._stablePose.legs.right;
		const far = StableViewProfile.isFar(view, side);
		const hipBase = side < 0 ? data._skeleton.leftHip : data._skeleton.rightHip;
		const depth = far ? -view.limbs.legDepth : view.limbs.legDepth;
		const compression = poseLeg.planted ? 0.88 : 1;
		const stretch = poseLeg.planted ? 1 : 1.08;
		const hip = {
			x: hipBase.x + depth + (poseLeg.hipX || 0) * view.limbs.gaitX,
			y: hipBase.y + (poseLeg.planted ? 2.2 : -1.2)
		};
		const knee = {
			x: hipBase.x + depth + poseLeg.kneeX * view.limbs.gaitX,
			y: metrics.kneeY + poseLeg.kneeY * compression
		};
		const ankle = {
			x: hipBase.x + depth + poseLeg.ankleX * view.limbs.gaitX,
			y: metrics.ankleY + poseLeg.ankleY * stretch
		};
		const foot = {
			x: hipBase.x + depth + poseLeg.footX * view.limbs.gaitX,
			y: metrics.footY + poseLeg.footY
		};
		const style = far
			? LineArtStyle.far(data, colors.pants)
			: LineArtStyle.outer(data, colors.pants);
		return S.group(`${prefix}_leg_${side}`, null, [
			S.shadow(`${prefix}_foot_shadow_${side}`, foot.x, foot.y + 9, far ? 10 : 14, far ? 3 : 4, 0.18),
			S.tapered(`${prefix}_thigh_${side}`, hip, knee, (metrics.legWidth + 6) * (poseLeg.planted ? 1.12 : 0.96), metrics.legWidth + 2, style),
			G.ellipse(`${prefix}_knee_cap_${side}`, knee.x, knee.y, far ? 3 : 4.5, far ? 2.3 : 3, 0, { fill: colors.pantsDark || colors.pants, stroke: 'rgba(0,0,0,.2)', lineWidth: 1 }),
			S.tapered(`${prefix}_shin_${side}`, knee, ankle, metrics.legWidth + 2, Math.max(5, metrics.legWidth - 2), style),
			StableFoot2D.build({ id: `${prefix}_foot_${side}`, x: foot.x, y: foot.y, side, c: colors, view, leg: poseLeg, far })
		]);
	}

	static arm(data, colors, metrics, side, id, alpha, view) {
		const poseArm = side < 0 ? data._stablePose.arms.left : data._stablePose.arms.right;
		const far = StableViewProfile.isFar(view, side);
		const shoulder = side < 0 ? data._skeleton.leftShoulder : data._skeleton.rightShoulder;
		const sleeve = data.archetype === 'sage' ? colors.robeLight : colors.jacket;
		const baseStyle = far ? LineArtStyle.far(data, sleeve) : LineArtStyle.outer(data, sleeve);
		const style = { ...baseStyle, globalAlpha: alpha * (baseStyle.globalAlpha || 1) };
		const direction = side < 0 ? -1 : 1;
		const time = Number(data._renderTime || 0);
		const pulse = Math.sin(time * 0.004 + side * 0.7);
		const gesture = String(data.gesture || data.currentPerformance?.gesture || '');
		const offset = StableGestureOffsets.resolve({ gesture, side, pulse, talking: Boolean(data.isTalking || data.speaking || data.speech === 'talk') });
		const drag = Number(poseArm.handX || 0) * 0.12;
		const shoulderPoint = { x: shoulder.x, y: shoulder.y + 8 + (poseArm.shoulderLift || 0) + Math.sin(time * 0.0018 + side) * 1.8 + offset.shoulderY };
		const elbowPoint = { x: shoulderPoint.x + direction * ((poseArm.elbowX ?? 14) - drag + offset.elbowX), y: shoulderPoint.y + (poseArm.elbowY ?? 38) + offset.elbowY };
		const handPoint = { x: elbowPoint.x + direction * ((poseArm.handX ?? 10) + drag * 0.6 + offset.handX), y: elbowPoint.y + (poseArm.handY ?? 30) + offset.handY };
		const handPose = poseArm.handPose || offset.handPose;
		return S.group(id, null, [
			G.ellipse(`${id}_shoulder_socket`, shoulderPoint.x, shoulderPoint.y, far ? 8 : 11, 9, 0, style),
			S.tapered(`${id}_upper`, shoulderPoint, elbowPoint, far ? metrics.armWidth + 3 : metrics.armWidth + 8, far ? metrics.armWidth : metrics.armWidth + 3, style),
			S.tapered(`${id}_fore`, elbowPoint, handPoint, far ? metrics.armWidth : metrics.armWidth + 3, far ? metrics.armWidth - 2 : metrics.armWidth, style),
			G.ellipse(`${id}_elbow_soft_cover`, elbowPoint.x, elbowPoint.y, far ? 3.2 : 4.5, far ? 2.5 : 3.2, 0, { fill: sleeve, stroke: 'rgba(0,0,0,.2)', lineWidth: far ? 0.8 : 1 }),
			this.cuff(`${id}_cuff`, handPoint, direction, sleeve, colors),
			S.hand(`${id}_hand`, handPoint.x, handPoint.y + 2, direction, colors, handPose)
		]);
	}

	static cuff(id, hand, direction, sleeve, colors) {
		return G.ellipse(id, hand.x - direction * 5, hand.y + 1, 5.5, 3.2, direction * 0.2, { fill: sleeve, stroke: colors.line, lineWidth: 1 });
	}
}
