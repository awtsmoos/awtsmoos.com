// B"H
// Boruch Hashem
// Blessed is He

import { CycleMath } from '../math/CycleMath.js';

/**
 * @file FootPlant.js
 * @description Evaluates support, swing clearance, roll, and local foot travel.
 * The Awtsmoos renews the world beneath every planted sole; Awtsmoos.com lets
 * contact carry weight, then releases that weight before the next stride is whole.
 */
export class FootPlant {
	/**
	 * Samples one foot across stance and swing.
	 *
	 * @param {number} phase - Wrapped gait phase.
	 * @param {Object} profile - Stride profile containing stanceRatio.
	 * @returns {Object} Contact mechanics and normalized foot motion.
	 */
	static sample(phase, profile = {}) {
		const p = CycleMath.wrap01(phase);
		const stanceRatio = this.clamp(profile.stanceRatio ?? 0.62, 0.25, 0.78);
		const planted = p < stanceRatio;
		const stance = planted ? p / stanceRatio : 1;
		const swing = planted ? 0 : (p - stanceRatio) / (1 - stanceRatio);
		const lift = planted ? 0 : this.swingLift(swing);
		const travel = planted
			? 0.5 - stance
			: -0.5 + CycleMath.smooth(swing);
		const supportWeight = planted ? this.supportWeight(stance) : 0;
		const compression = planted ? this.compression(stance) : 0;

		return {
			phaseName: this.phaseName(planted, stance, swing),
			planted,
			airborne: !planted,
			contact: planted ? 1 : 0,
			supportWeight,
			stance,
			swing,
			lift,
			travel,
			compression,
			heelRoll: planted && stance < 0.2 ? (1 - CycleMath.smooth(stance / 0.2)) * 0.2 : 0,
			toeRoll: planted && stance > 0.74 ? CycleMath.smooth((stance - 0.74) / 0.26) * 0.28 : 0
		};
	}

	/** @param {number} swing @returns {number} Asymmetric toe-clearance arc. */
	static swingLift(swing) {
		if (swing <= 0.56) {
			return CycleMath.smooth(swing / 0.56);
		}
		return 1 - CycleMath.smooth((swing - 0.56) / 0.44);
	}

	/** @param {number} stance @returns {number} Continuous supported weight. */
	static supportWeight(stance) {
		const arrival = CycleMath.smooth(Math.min(1, stance / 0.12));
		const departure = CycleMath.smooth(Math.min(1, (1 - stance) / 0.2));
		return Math.min(arrival, departure);
	}

	/** @param {number} stance @returns {number} Knee/pelvis compression around down pose. */
	static compression(stance) {
		if (stance >= 0.62) {
			return 0;
		}
		const centered = Math.abs(stance - 0.32) / 0.32;
		return 1 - CycleMath.smooth(Math.min(1, centered));
	}

	/** @param {boolean} planted @param {number} stance @param {number} swing @returns {string} Pose phase. */
	static phaseName(planted, stance, swing) {
		if (planted) {
			return stance < 0.18 ? 'contact' : stance < 0.58 ? 'down' : 'push';
		}
		return swing < 0.45 ? 'passing' : swing < 0.8 ? 'up' : 'reach';
	}

	/** @param {number} value @param {number} min @param {number} max @returns {number} Safe clamp. */
	static clamp(value, min, max) {
		const number = Number(value);
		return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : min;
	}
}
