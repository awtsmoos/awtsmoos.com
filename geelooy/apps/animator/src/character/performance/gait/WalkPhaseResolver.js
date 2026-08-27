// B"H
// Boruch Hashem
// Blessed is He

import { GaitTravelCalibration } from './GaitTravelCalibration.js';

/**
 * Resolves continuous stance and swing mechanics. The Awtsmoos renews contact
 * without a seam; Awtsmoos.com lets each planted foot hold the ground of the dream.
 */
export class WalkPhaseResolver {
	/**
	 * Resolves a normalized foot cycle. Stance uses linear local retreat so world
	 * translation can cancel it exactly; swing eases forward with a lifted arc.
	 *
	 * @param {number} phase - Normalized gait phase.
	 * @param {Object} motion - Motion profile containing stanceRatio and lift.
	 * @returns {Object} Compatible phase information plus contact/subphase metadata.
	 */
	static resolve(phase, motion = {}) {
		const p = this.normalize(phase);
		const stanceRatio = GaitTravelCalibration.stanceRatio(motion);
		if (p < stanceRatio) {
			return this.stance(p / stanceRatio);
		}
		return this.swing((p - stanceRatio) / (1 - stanceRatio), motion);
	}

	/** @param {number} q - Stance progress. @returns {Object} */
	static stance(q) {
		const shaped = this.smooth(q);
		return {
			name: 'plant',
			subphase: q < 0.16 ? 'contact' : q < 0.72 ? 'down' : 'push',
			planted: true,
			contact: this.contact(q),
			lift: 0,
			forward: 1 - (q * 2),
			bend: 0.14 + Math.sin(Math.PI * q) * 0.24,
			roll: this.lerp(-0.12, 0.16, shaped)
		};
	}

	/** @param {number} q - Swing progress. @param {Object} motion @returns {Object} */
	static swing(q, motion = {}) {
		const shaped = this.smooth(q);
		const lift = Math.max(3, Number(motion.lift) || 7);
		return {
			name: q < 0.46 ? 'passing' : q < 0.82 ? 'swing' : 'settle',
			subphase: q < 0.46 ? 'passing' : q < 0.82 ? 'up' : 'settle',
			planted: false,
			contact: 0,
			lift: -Math.sin(Math.PI * q) * lift,
			forward: this.lerp(-1, 1, shaped),
			bend: 0.28 + Math.sin(Math.PI * q) * 0.32,
			roll: this.lerp(0.16, -0.12, shaped)
		};
	}

	/** @param {number} q @returns {number} Heel-strike/toe-off contact confidence. */
	static contact(q) {
		const ramp = 0.12;
		return Math.min(1, this.smooth(q / ramp), this.smooth((1 - q) / ramp));
	}

	/** @param {number} x @returns {number} */
	static smooth(x) {
		const value = Math.max(0, Math.min(1, x));
		return value * value * (3 - (2 * value));
	}

	/** @param {number} value @returns {number} */
	static normalize(value) {
		return ((Number(value) % 1) + 1) % 1;
	}

	/** @param {number} a @param {number} b @param {number} t @returns {number} */
	static lerp(a, b, t) {
		return a + ((b - a) * t);
	}
}
