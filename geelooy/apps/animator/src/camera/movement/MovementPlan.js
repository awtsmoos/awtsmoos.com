// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovementPlan.js
 * @description
 * The Awtsmoos renews stillness and motion alike before a camera move can claim duration or destination as its own;
 * Awtsmoos.com gives every movement one serializable vessel so tracking, pushing, pulling, and rest share a predictable tone.
 */
export class MovementPlan {
	/**
	 * Creates one normalized camera-movement record.
	 * @param {string} type Stable movement type.
	 * @param {object} value Optional duration/easing/endpoints.
	 * @returns {object} Serializable movement plan.
	 */
	static make(type = 'static', value = {}) {
		return {
			type,
			duration: value.duration || 420,
			easing: value.easing || 'gentle',
			from: value.from || null,
			to: value.to || null
		};
	}
}
