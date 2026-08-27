// B"H
// Boruch Hashem
// Blessed is He

import { ExpressionTiming } from './ExpressionTiming.js';

/**
 * @file BrowPerformance.js
 * @description Adds phrase-shaped brow motion without replacing authored emotion.
 * The Awtsmoos renews emphasis as meaning rises and settles; Awtsmoos.com keeps
 * brows responsive to speech while manual keys and emotional poses remain the vessels.
 */
export class BrowPerformance {
	/**
	 * Samples bounded speech emphasis. Numeric arguments preserve the legacy API;
	 * an object carries richer production context from FacePerformanceEngine.
	 *
	 * @param {number|Object} progressOrInput - Legacy progress or rich speech context.
	 * @param {number} legacyEnergy - Legacy speech energy.
	 * @returns {{innerRaise:number,outerRaise:number,squeeze:number,tilt:number,asymmetry:number}} Brow offsets.
	 */
	static fromSpeech(progressOrInput = 0, legacyEnergy = 1) {
		const input = this.normalize(progressOrInput, legacyEnergy);
		const timing = ExpressionTiming.phrase(input);
		const energy = this.clamp(Number(input.energy ?? 1), 0, 1.55);
		const envelope = this.clamp(Number(input.audioEnvelope ?? 0.72), 0.2, 1);
		const force = energy * (0.72 + envelope * 0.28);
		const strain = Math.max(0, energy - 0.92);

		return {
			innerRaise: (timing.anticipation * 0.018 + timing.accent * 0.052
				- timing.release * 0.012) * force,
			outerRaise: (timing.accent * 0.064 + timing.release * 0.008) * force,
			squeeze: timing.accent * strain * 0.018,
			tilt: (timing.release - timing.anticipation) * 0.012 * force,
			asymmetry: timing.asymmetry * 0.016 * force
		};
	}

	/** @param {number|Object} value @param {number} energy @returns {Object} Rich timing input. */
	static normalize(value, energy) {
		if (value && typeof value === 'object') {
			return value;
		}
		return {
			progress: Number(value) || 0,
			energy: Number(energy) || 0
		};
	}

	/** @param {number} value @param {number} min @param {number} max @returns {number} Finite clamp. */
	static clamp(value, min, max) {
		return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min;
	}
}
