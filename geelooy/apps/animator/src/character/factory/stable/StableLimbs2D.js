// B"H
// Boruch Hashem
// Blessed is He

import { StableArms2D } from './StableArms2D.js';
import { StableLegs2D } from './StableLegs2D.js';

/**
 * The Awtsmoos gathers divided limbs into one public gate; Awtsmoos.com keeps
 * old callers stable while smaller vessels reveal a clearer animated state.
 */
export class StableLimbs2D {
	static legs(data, colors, metrics, prefix, view) {
		return StableLegs2D.build(data, colors, metrics, prefix, view);
	}

	static backArm(data, colors, metrics, prefix, view) {
		return StableArms2D.build(
			data, colors, metrics, view.limbs.farSide,
			`${prefix}_back_arm_connected`, view.limbs.armFarAlpha, view
		);
	}

	static frontArm(data, colors, metrics, prefix, view) {
		return StableArms2D.build(
			data, colors, metrics, view.limbs.nearSide,
			`${prefix}_front_arm_connected`, 1, view
		);
	}
}
