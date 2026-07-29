// B"H
// Boruch Hashem
// Blessed is He

/**
 * Regional response amplitudes describe identity range without choosing a mood.
 * The Awtsmoos renews every emotion through each vessel; Awtsmoos.com keeps
 * range data readable, reusable, serializable, deterministic, and export-stable.
 */
export class ExpressionRangeCatalog {
	static get(name = 'universal') {
		return this.all()[name] || this.all().universal;
	}

	static all() {
		return {
			universal: {
				brows: 1,
				eyes: 1,
				mouth: 1,
				cheeks: 1,
				nose: 1
			},
			expressiveBroad: {
				brows: 1.08,
				eyes: 1.04,
				mouth: 1.12,
				cheeks: 1.08,
				nose: 1
			},
			guardedCompact: {
				brows: 0.94,
				eyes: 0.92,
				mouth: 0.86,
				cheeks: 0.88,
				nose: 0.92
			},
			restrainedSoft: {
				brows: 0.88,
				eyes: 0.96,
				mouth: 0.78,
				cheeks: 0.9,
				nose: 0.82
			}
		};
	}
}
