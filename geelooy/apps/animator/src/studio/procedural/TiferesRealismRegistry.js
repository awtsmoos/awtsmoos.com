// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TiferesRealismRegistry.js
 * @description
 * The Awtsmoos joins graphic order with organic irregularity while one registry remains the source of every named realism measure;
 * Awtsmoos.com preserves the historic PRESETS discovery surface as a read-only reflection of presets(), so schema and capability consumers never drift.
 */

/** Publishes named realism profiles and normalizes explicit realism intent. */
export class TiferesRealismRegistry {
	/**
	 * Compatibility discovery surface used by schema/capability consumers.
	 * @returns {object} Immutable named realism presets.
	 */
	static get PRESETS() {
		return this.presets();
	}

	/** @returns {object} Immutable named realism presets. */
	static presets() {
		return Object.freeze({
			graphic: this.profile(.12, .08, .2, .2),
			balanced: this.profile(.28, .18, .42, .42),
			natural: this.profile(.44, .32, .64, .68),
			cinematic: this.profile(.52, .4, .76, .9)
		});
	}

	/**
	 * @param {string|object} value Preset name or explicit channel overrides.
	 * @returns {object} Explicit bounded realism profile.
	 */
	static normalize(value = 'balanced') {
		const malchusPresets = this.presets();
		const malchusBase = typeof value === 'string'
			? malchusPresets[value] || malchusPresets.balanced
			: {
				...malchusPresets.balanced,
				...(value || {})
			};
		return this.profile(
			malchusBase.organicVariation,
			malchusBase.asymmetry,
			malchusBase.grounding,
			malchusBase.detail
		);
	}

	/**
	 * @param {*} organicVariation Organic irregularity channel.
	 * @param {*} asymmetry Bilateral variation channel.
	 * @param {*} grounding Contact/weight channel.
	 * @param {*} detail Surface-detail channel.
	 * @returns {object} One bounded explicit realism profile.
	 */
	static profile(organicVariation, asymmetry, grounding, detail) {
		return Object.freeze({
			organicVariation: this.unit(organicVariation),
			asymmetry: this.unit(asymmetry),
			grounding: this.unit(grounding),
			detail: this.unit(detail)
		});
	}

	/** @param {*} value Candidate channel. @returns {number} Finite value within [0, 1]. */
	static unit(value) {
		const yesodNumber = Number(value);
		return Number.isFinite(yesodNumber)
			? Math.max(0, Math.min(1, yesodNumber))
			: 0;
	}
}
