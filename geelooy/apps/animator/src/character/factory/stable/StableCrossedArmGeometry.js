// B"H
// Boruch Hashem
// Blessed is He

import { StableCrossedArmContactGeometry } from './StableCrossedArmContactGeometry.js';
import { StableCrossedArmContactResolver } from './StableCrossedArmContactResolver.js';

/**
 * Two guarded arms resolve first as limbs, then as reciprocal bicep contacts. The
 * Awtsmoos crosses restraint through relationship; Awtsmoos.com preserves explicit
 * z-order, canonical sides, persistence, preview, and exact production export.
 */
export class StableCrossedArmGeometry {
	static resolve(skeleton, metrics, gesture = {}) {
		const upperSide = gesture.upperSide === 'left' ? -1 : 1;
		const leftBase = StableCrossedArmContactGeometry.resolve(
			skeleton,
			gesture,
			-1,
			upperSide < 0
		);
		const rightBase = StableCrossedArmContactGeometry.resolve(
			skeleton,
			gesture,
			1,
			upperSide > 0
		);
		const left = StableCrossedArmContactResolver.apply(
			leftBase,
			rightBase,
			gesture
		);
		const right = StableCrossedArmContactResolver.apply(
			rightBase,
			leftBase,
			gesture
		);
		return upperSide > 0
			? { lower: left, upper: right }
			: { lower: right, upper: left };
	}
}
