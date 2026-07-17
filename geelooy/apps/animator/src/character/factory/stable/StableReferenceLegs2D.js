// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { FootRenderer } from './limbs/FootRenderer.js';

/**
 * The Awtsmoos broadens planted trousers and shoes without severing them from
 * the living skeleton. Awtsmoos.com reads only serializable stance geometry, so
 * every knee, ankle, breath, save, reload, and export remains one production rig.
 */
export class StableReferenceLegs2D {
	static build(data, colors, metrics, prefix, view) {
		const geometry = data.bodyGeometry?.legs || {};
		const order = view.type === 'front'
			? [-1, 1]
			: [view.limbs.farSide, view.limbs.nearSide];
		return S.group(`${prefix}_reference_legs`, null, order.map(side => (
			data.skirt
				? this.shoeOnly(data, colors, metrics, prefix, view, geometry, side)
				: this.leg(data, colors, metrics, prefix, view, geometry, side)
		)));
	}

	static leg(data, colors, metrics, prefix, view, geometry, side) {
		const pose = side < 0
			? data._stablePose.legs.left
			: data._stablePose.legs.right;
		const centerX = data._skeleton.hips.x;
		const breath = Math.sin(Number(data._renderTime || 0) * 0.0018 + side) * 0.7;
		const hip = {
			x: centerX + side * this.number(geometry.hipOffset, 20),
			y: metrics.hipY - 4 + breath
		};
		const knee = {
			x: centerX + side * this.number(geometry.kneeOffset, 19)
				+ Number(pose.kneeX || 0) * 0.18,
			y: metrics.kneeY + this.number(geometry.kneeDrop, 3)
		};
		const ankle = {
			x: centerX + side * this.number(geometry.ankleOffset, 19)
				+ Number(pose.ankleX || 0) * 0.12,
			y: metrics.ankleY + this.number(geometry.ankleLift, -1)
		};
		const foot = this.foot(centerX, metrics, geometry, side);
		const style = LineArtStyle.outer(data, colors.pants);
		return S.group(`${prefix}_reference_leg_${side}`, null, [
			S.tapered(`${prefix}_reference_thigh_${side}`, hip, knee, this.number(geometry.thighWidth, 24), this.number(geometry.kneeWidth, 21), style),
			S.tapered(`${prefix}_reference_shin_${side}`, knee, ankle, this.number(geometry.kneeWidth, 21), this.number(geometry.ankleWidth, 18), style),
			this.shoe(colors, view, pose, geometry, foot, prefix, side)
		]);
	}

	static shoeOnly(data, colors, metrics, prefix, view, geometry, side) {
		const pose = side < 0
			? data._stablePose.legs.left
			: data._stablePose.legs.right;
		const foot = this.foot(data._skeleton.hips.x, metrics, geometry, side);
		return this.shoe(colors, view, pose, geometry, foot, prefix, side);
	}

	static shoe(colors, view, pose, geometry, foot, prefix, side) {
		return FootRenderer.build({
			id: `${prefix}_reference_foot_${side}`,
			x: foot.x,
			y: foot.y,
			side,
			c: colors,
			view,
			leg: { ...pose, planted: true },
			far: false,
			scaleX: this.number(geometry.shoeScaleX, 1.3),
			scaleY: this.number(geometry.shoeScaleY, 1.08)
		});
	}

	static foot(centerX, metrics, geometry, side) {
		return {
			x: centerX + side * this.number(geometry.footOffset, 22),
			y: metrics.footY + this.number(geometry.footDrop, 0)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
