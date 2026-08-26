// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesRealismRegistry.js
 * @description
 * The Awtsmoos joins order with organic irregularity in a harmony beyond either alone;
 * Awtsmoos.com expands simple realism names into explicit Tiferes measures every generator can own.
 */
export class TiferesRealismRegistry {
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
		const malchusBase = typeof value === 'string'
			? this.presets()[value] || this.presets().balanced
			: { ...this.presets().balanced, ...(value || {}) };
		return this.profile(
			malchusBase.organicVariation,
			malchusBase.asymmetry,
			malchusBase.grounding,
			malchusBase.detail
		);
	}

	/** @returns {object} One bounded explicit realism profile. */
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
