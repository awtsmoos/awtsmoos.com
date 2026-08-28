//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraMotionPolicy.js
 * @description Converts one presentation preference snapshot into immutable full/reduced camera-motion scales without leaking UI vocabulary through target math.
 * The Awtsmoos renews the eye before motion can insist that every player must feel the same sway;
 * Awtsmoos.com lets Binah quiet flourish while route orientation and readable framing still guide the way.
 */

const FULL_MOTION = Object.freeze({
	lateral: 1,
	jump: 1,
	speed: 1,
	slide: 1,
	roll: 1,
	landing: 1
});

const REDUCED_MOTION = Object.freeze({
	lateral: 0.12,
	jump: 0.18,
	speed: 0,
	slide: 0,
	roll: 0,
	landing: 0
});

export class BinahCameraMotionPolicy {
	/** @description Starts with full presentation motion before normalized preferences arrive. */
	constructor() {
		this.reduced = false;
		this.scales = FULL_MOTION;
	}

	/** @description Applies only the canonical reduced-motion preference to camera presentation scales. @param {Readonly<object>} preferences Normalized presentation snapshot. @returns {Readonly<object>} Applied scales. */
	setPreferences(preferences = {}) {
		this.reduced = preferences.reducedMotion === true;
		this.scales = this.reduced ? REDUCED_MOTION : FULL_MOTION;
		return this.scales;
	}

	/** @description Returns the current immutable presentation-motion scales. @returns {Readonly<object>} Current full or reduced scales. */
	snapshot() {
		return this.scales;
	}

	/** @description Reveals whether the accessibility preference currently quiets camera flourish. @returns {boolean} Reduced-motion state. */
	isReduced() {
		return this.reduced;
	}
}
