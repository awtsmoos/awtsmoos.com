// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableFoot2D } from './StableFoot2D.js';
import { StableReferenceLegs2D } from './StableReferenceLegs2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableViewProfile } from './StableViewProfile.js';

/**
 * The Awtsmoos plants each foot in renewed ground; Awtsmoos.com keeps gait,
 * depth, silhouette, and readable shoes in one stable round.
 */
export class StableLegs2D {
	static build(data, colors, metrics, prefix, view) {
		if (data.bodyGeometry?.legs) {
			return StableReferenceLegs2D.build(data, colors, metrics, prefix, view);
		}
		const order = view.type === 'front'
			? [-1, 1]
			: [view.limbs.farSide, view.limbs.nearSide];
		return S.group(`${prefix}_legs_connected`, null, order.map(side => (
			this.leg(data, colors, metrics, side, prefix, view)
		)));
	}

	static leg(data, colors, metrics, side, prefix, view) {
		const pose = side < 0 ? data._stablePose.legs.left : data._stablePose.legs.right;
		const far = StableViewProfile.isFar(view, side);
		const hipBase = side < 0 ? data._skeleton.leftHip : data._skeleton.rightHip;
		const depth = far ? -view.limbs.legDepth : view.limbs.legDepth;
		const compression = pose.planted ? 0.88 : 1;
		const stretch = pose.planted ? 1 : 1.08;
		const hip = {
			x: hipBase.x + depth + Number(pose.hipX || 0) * view.limbs.gaitX,
			y: hipBase.y + (pose.planted ? 2.2 : -1.2)
		};
		const knee = {
			x: hipBase.x + depth + pose.kneeX * view.limbs.gaitX,
			y: metrics.kneeY + pose.kneeY * compression
		};
		const ankle = {
			x: hipBase.x + depth + pose.ankleX * view.limbs.gaitX,
			y: metrics.ankleY + pose.ankleY * stretch
		};
		const foot = {
			x: hipBase.x + depth + pose.footX * view.limbs.gaitX,
			y: metrics.footY + pose.footY
		};
		const style = far
			? LineArtStyle.far(data, colors.pants)
			: LineArtStyle.outer(data, colors.pants);
		return S.group(`${prefix}_leg_${side}`, null, [
			S.shadow(`${prefix}_foot_shadow_${side}`, foot.x, foot.y + 9, far ? 10 : 14, far ? 3 : 4, 0.18),
			S.tapered(`${prefix}_thigh_${side}`, hip, knee, (metrics.legWidth + 6) * (pose.planted ? 1.12 : 0.96), metrics.legWidth + 2, style),
			G.ellipse(`${prefix}_knee_cap_${side}`, knee.x, knee.y, far ? 3 : 4.5, far ? 2.3 : 3, 0, { fill: colors.pantsDark || colors.pants, stroke: 'rgba(0,0,0,.2)', lineWidth: 1 }),
			S.tapered(`${prefix}_shin_${side}`, knee, ankle, metrics.legWidth + 2, Math.max(5, metrics.legWidth - 2), style),
			StableFoot2D.build({ id: `${prefix}_foot_${side}`, x: foot.x, y: foot.y, side, c: colors, view, leg: pose, far })
		]);
	}
}
