// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { FootRenderer } from './limbs/FootRenderer.js';

/**
 * The Awtsmoos broadens hip, knee, calf, ankle, and shoe into planted human weight.
 * Awtsmoos.com reads only serializable stance geometry, so every step remains one
 * editable production rig rather than a pair of rectangular trouser columns.
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
		const breath = Math.sin(Number(data._renderTime || 0) * 0.0018 + side) * 0.6;
		const hip = {
			x: centerX + side * this.number(geometry.hipOffset, 22),
			y: metrics.hipY - 3 + breath
		};
		const knee = {
			x: centerX + side * this.number(geometry.kneeOffset, 22)
				+ Number(pose.kneeX || 0) * 0.16,
			y: metrics.kneeY + this.number(geometry.kneeDrop, 2)
		};
		const ankle = {
			x: centerX + side * this.number(geometry.ankleOffset, 21)
				+ Number(pose.ankleX || 0) * 0.1,
			y: metrics.ankleY + this.number(geometry.ankleLift, -2)
		};
		const foot = this.foot(centerX, metrics, geometry, side);
		const style = LineArtStyle.outer(data, colors.pants);
		const thighWidth = this.number(geometry.thighWidth, 30);
		const kneeWidth = this.number(geometry.kneeWidth, 25);
		const ankleWidth = this.number(geometry.ankleWidth, 20);

		return S.group(`${prefix}_reference_leg_${side}`, null, [
			StableReferenceLimbPath2D.build(
				`${prefix}_reference_thigh_${side}`,
				hip,
				knee,
				thighWidth,
				kneeWidth,
				style,
				side * this.number(geometry.thighBend, 1.8)
			),
			StableReferenceLimbPath2D.build(
				`${prefix}_reference_shin_${side}`,
				knee,
				ankle,
				kneeWidth,
				ankleWidth,
				style,
				side * this.number(geometry.calfBend, -1.4)
			),
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
			scaleX: this.number(geometry.shoeScaleX, 1.35),
			scaleY: this.number(geometry.shoeScaleY, 1.18)
		});
	}

	static foot(centerX, metrics, geometry, side) {
		return {
			x: centerX + side * this.number(geometry.footOffset, 24),
			y: metrics.footY + this.number(geometry.footDrop, 0)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
