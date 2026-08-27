// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BlinkScheduler.js
 * @description Produces deterministic eyelid closure envelopes for render-time acting.
 * The Awtsmoos renews each instant without a mechanical metronome; Awtsmoos.com
 * lets this vessel close, hold, and open the eyes with intention instead of a snap.
 */
export class BlinkScheduler {
	/**
	 * Samples eyelid closure from 0 (open) to 1 (closed).
	 * The numeric third argument remains supported as legacy emphasis.
	 *
	 * @param {number} time - Render time in milliseconds.
	 * @param {number} seed - Stable per-character seed.
	 * @param {number|Object} context - Legacy emphasis or layered attention context.
	 * @returns {number} Deterministic blink amount in the inclusive 0..1 range.
	 */
	static sample(time = 0, seed = 1, context = 0) {
		const state = this.normalizeContext(context);
		if (state.surprise >= 0.72) {
			return 0;
		}

		const interval = this.interval(seed, state);
		const offset = this.hash(seed, 17) * interval;
		const shiftedTime = Number.isFinite(time) ? time + offset : offset;
		const localTime = this.modulo(shiftedTime, interval);
		const cycleIndex = Math.floor(shiftedTime / interval);
		const duration = 155 + state.fatigue * 85;
		const primary = this.envelope(localTime, duration);
		const doubleBlink = state.fatigue > 0.58
			&& this.hash(seed + cycleIndex, 43) > 0.56;

		if (!doubleBlink) {
			return primary;
		}

		const secondStart = duration + 95;
		const secondary = this.envelope(localTime - secondStart, duration * 0.9);
		return Math.max(primary, secondary);
	}

	/** @param {number|Object} context @returns {Object} Normalized acting context. */
	static normalizeContext(context) {
		const source = typeof context === 'number' ? { emphasis: context } : context || {};
		return {
			emphasis: this.clamp01(source.emphasis),
			fatigue: this.clamp01(source.fatigue),
			surprise: this.clamp01(source.surprise),
			talking: Boolean(source.talking)
		};
	}

	/** @param {number} seed @param {Object} state @returns {number} Blink interval in ms. */
	static interval(seed, state) {
		const naturalVariation = 3300 + this.hash(seed, 7) * 1800;
		const fatigueSpeedup = state.fatigue * 1150;
		const attentionDelay = state.emphasis * 360 + (state.talking ? 160 : 0);
		return Math.max(1800, naturalVariation - fatigueSpeedup + attentionDelay);
	}

	/** @param {number} localTime @param {number} duration @returns {number} Closure envelope. */
	static envelope(localTime, duration) {
		if (localTime < 0 || localTime > duration) {
			return 0;
		}

		const closeEnd = duration * 0.32;
		const holdEnd = duration * 0.5;
		if (localTime <= closeEnd) {
			return this.smooth(localTime / closeEnd);
		}
		if (localTime <= holdEnd) {
			return 1;
		}

		return 1 - this.smooth((localTime - holdEnd) / (duration - holdEnd));
	}

	/** @param {number} value @returns {number} Clamped normalized value. */
	static clamp01(value) {
		const number = Number(value);
		return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0;
	}

	/** @param {number} value @returns {number} Smoothstep value. */
	static smooth(value) {
		const t = this.clamp01(value);
		return t * t * (3 - 2 * t);
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
