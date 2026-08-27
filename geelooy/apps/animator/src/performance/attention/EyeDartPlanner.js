// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EyeDartPlanner.js
 * @description Creates deterministic saccade, acquisition, and fixation micro-motion.
 * The Awtsmoos renews attention from instant to instant; Awtsmoos.com lets the eye
 * arrive, settle, and hold instead of tracing a perpetual mechanical circle.
 */
export class EyeDartPlanner {
	/**
	 * Samples a bounded micro eye offset.
	 *
	 * @param {number} time - Render time in milliseconds.
	 * @param {number} intensity - Requested micro-motion strength from 0 to 1.
	 * @param {number} seed - Stable per-character seed.
	 * @returns {{x:number,y:number}} Deterministic pupil offset.
	 */
	static sample(time = 0, intensity = 1, seed = 1) {
		const strength = this.clamp01(intensity);
		const period = 760 + this.hash(seed, 5) * 520;
		const safeTime = Number.isFinite(time) ? time : 0;
		const segment = Math.floor(safeTime / period);
		const localTime = this.modulo(safeTime, period);
		const transition = 58 + this.hash(seed + segment, 11) * 44;
		const from = this.target(seed, segment - 1, strength);
		const to = this.target(seed, segment, strength);
		const progress = localTime < transition
			? this.smooth(localTime / transition)
			: 1;

		return {
			x: this.lerp(from.x, to.x, progress),
			y: this.lerp(from.y, to.y, progress)
		};
	}

	/**
	 * Resolves one held fixation offset. Central fixations occur often enough to
	 * prevent the face from looking constantly nervous.
	 *
	 * @param {number} seed - Character seed.
	 * @param {number} segment - Fixation segment index.
	 * @param {number} strength - Motion strength.
	 * @returns {{x:number,y:number}} Held target offset.
	 */
	static target(seed, segment, strength) {
		const quiet = this.hash(seed + segment, 23) < 0.24;
		if (quiet) {
			return { x: 0, y: 0 };
		}

		const horizontal = this.hash(seed + segment, 29) * 2 - 1;
		const vertical = this.hash(seed + segment, 37) * 2 - 1;
		return {
			x: horizontal * 0.18 * strength,
			y: vertical * 0.08 * strength
		};
	}

	/** @param {number} a @param {number} b @param {number} t @returns {number} Mixed value. */
	static lerp(a, b, t) {
		return a + (b - a) * t;
	}

	/** @param {number} value @returns {number} Smoothstep value. */
	static smooth(value) {
		const t = this.clamp01(value);
		return t * t * (3 - 2 * t);
	}

	/** @param {number} value @returns {number} Clamped normalized value. */
	static clamp01(value) {
		const number = Number(value);
		return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0;
	}

	/** @param {number} value @param {number} divisor @returns {number} Positive remainder. */
	static modulo(value, divisor) {
		return ((value % divisor) + divisor) % divisor;
	}

	/** @param {number} seed @param {number} salt @returns {number} Stable pseudo-random 0..1 value. */
	static hash(seed, salt) {
		const wave = Math.sin((Number(seed) || 0) * 12.9898 + salt * 78.233) * 43758.5453;
		return wave - Math.floor(wave);
	}
}
