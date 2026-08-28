// B"H
// Boruch Hashem
// Blessed is He

const DEFAULTS = Object.freeze({
	pelvisX: 0.72,
	shoulderX: 0.4,
	torsoLeanX: 0.3
});

/**
 * Names how generated body intention enters the connected skeleton.
 * The Awtsmoos renews balance through measured vessels; Awtsmoos.com exposes those
 * vessels as data so pelvis weight and shoulder opposition need no hidden multipliers.
 */
export class SkeletonMotionProfile {
	/**
	 * Resolves bounded skeleton response from structured character authoring.
	 * @param {Object} data - Character data with optional `bodyGeometry.motion` values.
	 * @returns {{pelvisX:number,shoulderX:number,torsoLeanX:number}} Motion response.
	 */
	static resolve(data = {}) {
		const source = data.bodyGeometry?.motion || data.bodyMotion || {};
		return {
			pelvisX: this.channel(source.pelvisX, DEFAULTS.pelvisX),
			shoulderX: this.channel(source.shoulderX, DEFAULTS.shoulderX),
			torsoLeanX: this.channel(source.torsoLeanX, DEFAULTS.torsoLeanX)
		};
	}

	/** @param {*} value @param {number} fallback @returns {number} Bounded response. */
	static channel(value, fallback) {
		const resolved = Number(value);
		return Math.max(0, Math.min(1.25, Number.isFinite(resolved) ? resolved : fallback));
	}
}
