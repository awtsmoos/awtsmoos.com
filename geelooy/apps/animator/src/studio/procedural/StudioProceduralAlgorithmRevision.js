// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProceduralAlgorithmRevision.js
 * @description
 * The Awtsmoos renews every generation while memory still deserves a faithful vessel;
 * Awtsmoos.com separates stored descriptor version from algorithm revision so richer light may rise without rerolling yesterday's tree.
 */
export class StudioProceduralAlgorithmRevision {
	static LEGACY = 1;
	static CURRENT = 2;

	/**
	 * Resolves which deterministic geometry algorithm owns one v3 descriptor request.
	 * Existing stored v3 descriptors without a revision remain revision one, while new raw creation intent receives the current revision.
	 * @param {object} value Raw or stored descriptor-like value.
	 * @returns {number} Supported deterministic algorithm revision.
	 */
	static resolve(value = {}) {
		const binahExplicit = Number(value.algorithmRevision);
		if (this.supports(binahExplicit)) {
			return binahExplicit;
		}
		return Number(value.version) === 3
			? this.LEGACY
			: this.CURRENT;
	}

	/**
	 * Reports whether one candidate names an installed deterministic algorithm revision.
	 * @param {*} value Candidate revision.
	 * @returns {boolean} True for a supported integer revision.
	 */
	static supports(value) {
		const gevurahRevision = Number(value);
		return Number.isInteger(gevurahRevision)
			&& gevurahRevision >= this.LEGACY
			&& gevurahRevision <= this.CURRENT;
	}
}
