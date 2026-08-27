// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableGestureOffsets } from './StableGestureOffsets.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableViewProfile } from './StableViewProfile.js';

/**
 * The Awtsmoos carries intention from shoulder to hand; Awtsmoos.com keeps
 * phased gesture, view depth, cuffs, and fingers readable where actors stand.
 */
export class StableArms2D {
	static build(data, colors, metrics, side, id, alpha, view) {
		const pose = side < 0 ? data._stablePose.arms.left : data._stablePose.arms.right;
		const far = StableViewProfile.isFar(view, side);
		const shoulder = side < 0 ? data._skeleton.leftShoulder : data._skeleton.rightShoulder;
		const sleeve = data.archetype === 'sage' ? colors.robeLight : colors.jacket;
		const baseStyle = far ? LineArtStyle.far(data, sleeve) : LineArtStyle.outer(data, sleeve);
		const style = { ...baseStyle, globalAlpha: alpha * (baseStyle.globalAlpha || 1) };
		const direction = side < 0 ? -1 : 1;
		const time = Number(data._renderTime || 0);
		const pulse = Math.sin(time * 0.004 + side * 0.7);
		const offset = StableGestureOffsets.resolve({
			gesture: String(data.gesture || data.currentPerformance?.gesture || ''),
			side,
			pulse,
			talking: Boolean(data.isTalking || data.speaking || data.speech === 'talk'),
			evaluated: Boolean(data._stablePose?.meta?.gesturePhase),
			handPose: pose.handPose || 'relaxed'
		});
		const drag = Number(pose.handX || 0) * 0.12;
		const shoulderPoint = {
			x: shoulder.x,
			y: shoulder.y + 8 + Number(pose.shoulderLift || 0)
				+ Math.sin(time * 0.0018 + side) * 1.8 + offset.shoulderY
		};
		const elbowPoint = {
			x: shoulderPoint.x + direction * ((pose.elbowX ?? 14) - drag + offset.elbowX),
			y: shoulderPoint.y + (pose.elbowY ?? 38) + offset.elbowY
		};
		const handPoint = {
			x: elbowPoint.x + direction * ((pose.handX ?? 10) + drag * 0.6 + offset.handX),
			y: elbowPoint.y + (pose.handY ?? 30) + offset.handY
		};
		return S.group(id, null, [
			G.ellipse(`${id}_shoulder_socket`, shoulderPoint.x, shoulderPoint.y, far ? 8 : 11, 9, 0, style),
			S.tapered(`${id}_upper`, shoulderPoint, elbowPoint, far ? metrics.armWidth + 3 : metrics.armWidth + 8, far ? metrics.armWidth : metrics.armWidth + 3, style),
			S.tapered(`${id}_fore`, elbowPoint, handPoint, far ? metrics.armWidth : metrics.armWidth + 3, far ? metrics.armWidth - 2 : metrics.armWidth, style),
			G.ellipse(`${id}_elbow_soft_cover`, elbowPoint.x, elbowPoint.y, far ? 3.2 : 4.5, far ? 2.5 : 3.2, 0, { fill: sleeve, stroke: 'rgba(0,0,0,.2)', lineWidth: far ? 0.8 : 1 }),
			this.cuff(`${id}_cuff`, handPoint, direction, sleeve, colors),
			S.hand(`${id}_hand`, handPoint.x, handPoint.y + 2, direction, colors, pose.handPose || offset.handPose)
		]);
	}

	static cuff(id, hand, direction, sleeve, colors) {
		return G.ellipse(
			id, hand.x - direction * 5, hand.y + 1, 5.5, 3.2, direction * 0.2,
			{ fill: sleeve, stroke: colors.line, lineWidth: 1 }
		);
	}
}
