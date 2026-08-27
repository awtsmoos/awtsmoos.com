// B"H
// Boruch Hashem
// Blessed is He

/**
 * Calibrates visible stride against world travel. The Awtsmoos renews every road
 * and every foot; Awtsmoos.com keeps their measures joined so planted steps stay good.
 * This vessel owns pure gait-distance math only and never mutates character state.
 */
export class GaitTravelCalibration {
	/**
	 * Converts a full left/right gait cycle into world-space travel distance.
	 * During stance the foot retreats two local stride radii while the body advances
	 * by the same amount, which keeps the planted contact fixed in world space.
	 *
	 * @param {Object} motion - Resolved locomotion profile.
	 * @returns {number} World units advanced by one gait cycle.
	 */
	static cycleDistance(motion = {}) {
		const stride = Math.max(4, Math.abs(Number(motion.stride) || 0));
		const stanceRatio = this.stanceRatio(motion);
		return (stride * 2) / stanceRatio;
	}

	/** @param {Object} motion - Motion profile. @returns {number} Safe stance ratio. */
	static stanceRatio(motion = {}) {
		const value = Number(motion.stanceRatio);
		return this.clamp(Number.isFinite(value) ? value : 0.62, 0.36, 0.72);
	}

	/**
	 * Resolves how many gait cycles the authored journey requires.
	 * Legacy loop counts remain as compatibility fallback when old data has no distance.
	 *
	 * @param {string} type - Locomotion type.
	 * @param {Object} data - Runtime character data.
	 * @param {Object} motion - Resolved locomotion profile.
	 * @returns {{cycles:number,cycleDistance:number,distance:number,measured:boolean}}
	 */
	static resolve(type, data = {}, motion = {}) {
		const cycleDistance = this.cycleDistance(motion);
		const distance = Math.abs(Number(data._travelDistance));
		if (Number.isFinite(distance) && distance > 0) {
			return {
				cycles: distance / cycleDistance,
				cycleDistance,
				distance,
				measured: true
			};
		}
		return {
			cycles: type === 'run' ? 2.8 : 1.6,
			cycleDistance,
			distance: 0,
			measured: false
		};
	}

	/** @param {number} value @param {number} min @param {number} max @returns {number} */
	static clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}
}
