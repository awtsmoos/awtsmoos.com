// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { FootRenderer } from './limbs/FootRenderer.js';

/**
 * Continuous trousers and character-authored shoes may carry unequal left and
 * right stance. The Awtsmoos plants every finite step, while Awtsmoos.com keeps
 * asymmetry editable, serializable, deterministic, and shared by preview/export.
 */
export class StableReferenceLegs2D {
	static build(data, colors, metrics, prefix, view) {
		const geometry = data.bodyGeometry?.legs || {};
		const order = view.type === 'front'
			? [-1, 1]
			: [view.limbs.farSide, view.limbs.nearSide];
		return S.group(`${prefix}_reference_legs`, null, order.map(side => (
			data.skirt
				? this.shoe(data, colors, metrics, prefix, view, geometry, side)
				: this.leg(data, colors, metrics, prefix, view, geometry, side)
		)));
	}

	static leg(data, colors, metrics, prefix, view, geometry, side) {
		const pose = side < 0
			? data._stablePose.legs.left
			: data._stablePose.legs.right;
		const centerX = this.centerX(data, geometry);
		const hip = {
			x: centerX + side * this.sideOffset(geometry, side, 'Hip', 'hipOffset', 22),
			y: metrics.hipY - 3
		};
		const knee = {
			x: centerX + side * this.sideOffset(geometry, side, 'Knee', 'kneeOffset', 22)
				+ Number(pose.kneeX || 0) * 0.16,
			y: metrics.kneeY + this.number(geometry.kneeDrop, 2)
		};
		const ankle = {
			x: centerX + side * this.sideOffset(geometry, side, 'Ankle', 'ankleOffset', 21)
				+ Number(pose.ankleX || 0) * 0.1,
			y: metrics.ankleY + this.number(geometry.ankleLift, -2)
		};
		return S.group(`${prefix}_reference_leg_${side}`, null, [
			this.mass(data, colors, prefix, side, geometry, hip, knee, ankle),
			this.shoe(data, colors, metrics, prefix, view, geometry, side)
		]);
	}

	static mass(data, colors, prefix, side, geometry, hip, knee, ankle) {
		const thigh = this.number(geometry.thighWidth, 30) * 0.5;
		const kneeHalf = this.number(geometry.kneeWidth, 25) * 0.5;
		const ankleHalf = this.number(geometry.ankleWidth, 20) * 0.5;
		return G.path(`${prefix}_continuous_trouser_${side}`, [
			{ type: 'move', x: hip.x - thigh, y: hip.y },
			{ type: 'quad', cx: knee.x - kneeHalf - 1, cy: (hip.y + knee.y) * 0.55, x: knee.x - kneeHalf, y: knee.y },
			{ type: 'quad', cx: ankle.x - ankleHalf - 1, cy: (knee.y + ankle.y) * 0.52, x: ankle.x - ankleHalf, y: ankle.y },
			{ type: 'quad', cx: ankle.x, cy: ankle.y + 3, x: ankle.x + ankleHalf, y: ankle.y },
			{ type: 'quad', cx: ankle.x + ankleHalf + 1, cy: (knee.y + ankle.y) * 0.52, x: knee.x + kneeHalf, y: knee.y },
			{ type: 'quad', cx: knee.x + kneeHalf + 1, cy: (hip.y + knee.y) * 0.55, x: hip.x + thigh, y: hip.y },
			{ type: 'quad', cx: hip.x, cy: hip.y + 4, x: hip.x - thigh, y: hip.y }
		], LineArtStyle.exterior(data, colors.pants));
	}

	static shoe(data, colors, metrics, prefix, view, geometry, side) {
		const pose = side < 0 ? data._stablePose.legs.left : data._stablePose.legs.right;
		return FootRenderer.build({
			id: `${prefix}_reference_foot_${side}`,
			x: this.centerX(data, geometry) + side * this.sideOffset(geometry, side, 'Foot', 'footOffset', 24),
			y: metrics.footY + this.number(geometry.footDrop, 0),
			side,
			c: colors,
			view,
			leg: { ...pose, planted: true },
			far: false,
			scaleX: this.number(geometry.shoeScaleX, 1.35),
			scaleY: this.number(geometry.shoeScaleY, 1.18),
			footwear: geometry.footwear,
			data
		});
	}

	static sideOffset(geometry, side, suffix, fallbackKey, fallback) {
		const sideKey = `${side < 0 ? 'left' : 'right'}${suffix}Offset`;
		return this.number(geometry[sideKey], this.number(geometry[fallbackKey], fallback));
	}

	static centerX(data, geometry) {
		return data._skeleton.hips.x + this.number(geometry.centerOffsetX, 0);
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
