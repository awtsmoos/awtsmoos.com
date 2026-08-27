// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpressionTiming.js
 * @description Stateless timing curves for anticipation, emphasis, release, and settle.
 * The Awtsmoos renews expression through ordered instants rather than a rigid wave;
 * Awtsmoos.com gives each phrase a beginning, a crest, and a quiet place to save.
 */
export class ExpressionTiming {
	/**
	 * Preserves the historical timing API while replacing abrupt linear ramps with ease.
	 *
	 * @param {number} time - Time in milliseconds.
	 * @returns {{eyeLead:number,mouthLag:number,settle:number}} Legacy timing channels.
	 */
	static phase(time = 0) {
		const local = this.modulo(Number(time) || 0, 900);
		return {
			eyeLead: this.smooth(local / 180),
			mouthLag: this.smooth((local - 120) / 240),
			settle: this.smooth(local / 600)
		};
	}

	/**
	 * Samples one authored-speech phrase with deterministic, non-periodic accents.
	 *
	 * @param {Object} input - Phrase context from the face engine.
	 * @returns {{anticipation:number,accent:number,release:number,settle:number,asymmetry:number}} Timing weights.
	 */
	static phrase(input = {}) {
		const progress = this.progress(input);
		const seed = this.seed(`${input.id || ''}|${input.speech || ''}`);
		const primaryCenter = 0.34 + this.hash(seed, 11) * 0.15;
		const secondaryCenter = 0.7 + this.hash(seed, 23) * 0.12;
		const primary = this.pulse(progress, primaryCenter, 0.2);
		const secondary = this.pulse(progress, secondaryCenter, 0.13)
			* (0.34 + this.hash(seed, 31) * 0.28);
		const accent = Math.max(primary, secondary);
		const anticipation = this.pulse(progress, primaryCenter - 0.14, 0.11) * 0.72;
		const release = this.pulse(progress, primaryCenter + 0.16, 0.17) * 0.58;

		return {
			anticipation,
			accent,
			release,
			settle: this.smooth((progress - 0.56) / 0.36),
			asymmetry: (this.hash(seed, 47) * 2 - 1) * accent
		};
	}

	/** @param {Object} input @returns {number} Normalized phrase progress. */
	static progress(input) {
		if (Number.isFinite(Number(input.progress))) {
			return this.clamp01(Number(input.progress));
		}
		const duration = Math.max(1, Number(input.duration) || 900);
		return this.clamp01((Number(input.time) || 0) / duration);
	}

	/** @param {number} value @param {number} center @param {number} width @returns {number} Smooth accent pulse. */
	static pulse(value, center, width) {
		const distance = Math.abs(value - center) / Math.max(0.001, width);
		return 1 - this.smooth(distance);
	}

	/** @param {number} value @returns {number} Clamped smoothstep. */
	static smooth(value) {
		const t = this.clamp01(value);
		return t * t * (3 - 2 * t);
	}

	/** @param {number} value @returns {number} Inclusive normalized clamp. */
	static clamp01(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}

	/** @param {number} value @param {number} divisor @returns {number} Positive remainder. */
	static modulo(value, divisor) {
		return ((value % divisor) + divisor) % divisor;
	}

	/** @param {string} text @returns {number} Stable FNV-style seed. */
	static seed(text) {
		return [...String(text)].reduce((hash, character) => (
			Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
		), 2166136261);
	}

	/** @param {number} seed @param {number} salt @returns {number} Stable normalized hash. */
	static hash(seed, salt) {
		const wave = Math.sin(seed * 0.000001 + salt * 78.233) * 43758.5453;
		return wave - Math.floor(wave);
	}
}
