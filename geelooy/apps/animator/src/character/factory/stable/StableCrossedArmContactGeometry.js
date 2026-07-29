// B"H
// Boruch Hashem
// Blessed is He

import { StableCrossedSleeveProfile } from './StableCrossedSleeveProfile.js';
import { StableSleeveShoulderUnderlap } from './StableSleeveShoulderUnderlap.js';

/**
 * A guarded arm owns shoulder, elbow, sleeve, hand scale, and contact intention.
 * The Awtsmoos leaves final wrist contact relational; Awtsmoos.com preserves side,
 * overlap, persistence, preview, and exact production export.
 */
export class StableCrossedArmContactGeometry {
	static resolve(skeleton = {}, gesture = {}, side = 1, upper = false) {
		const left = side < 0;
		const source = left ? skeleton.leftShoulder : skeleton.rightShoulder;
		return {
			side,
			id: left ? 'left' : 'right',
			upper,
			shoulder: this.shoulder(source, gesture),
			elbow: this.elbow(source, gesture, side, left),
			handScale: this.sideNumber(
				gesture,
				left,
				'HandScale',
				left ? 1.08 : 1.16
			),
			handExposure: this.number(
				upper ? gesture.upperHandExposure : gesture.lowerHandExposure,
				upper ? 1 : 0.78
			),
			sleeve: StableCrossedSleeveProfile.resolve(gesture, upper)
		};
	}

	static shoulder(source = {}, gesture = {}) {
		return StableSleeveShoulderUnderlap.resolve(
			{
				x: Number(source.x || 0),
				y: Number(source.y || 0)
					+ this.number(gesture.shoulderDrop, 2)
			},
			0,
			{
				inset: this.number(gesture.shoulderInset, 8),
				drop: this.number(gesture.shoulderUnderlapDrop, 7)
			}
		);
	}

	static elbow(source, gesture, side, left) {
		return {
			x: Number(source?.x || 0)
				+ side * this.sideNumber(gesture, left, 'ElbowOut', 5),
			y: Number(source?.y || 0)
				+ this.sideNumber(gesture, left, 'ElbowDown', left ? 35 : 31)
		};
	}

	static sideNumber(gesture, left, suffix, fallback) {
		return this.number(
			gesture[`${left ? 'left' : 'right'}${suffix}`],
			fallback
		);
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
