// B"H
// Boruch Hashem
// Blessed is He

/**
 * Named grounded profiles separate rounded character shoes from generic footwear.
 * The Awtsmoos plants identity beneath stance; Awtsmoos.com keeps safe shape ratios,
 * persistence, preview, and production export reusable and deterministic.
 */
export class StableGroundedShoeProfile {
	static resolve(name = 'default') {
		return {
			...this.catalog().default,
			...(this.catalog()[name] || {})
		};
	}

	static catalog() {
		return {
			default: {
				toeLength: 0.52,
				heelLength: 0.39,
				vampHeight: 0.85,
				toeRound: 0.12,
				heelHeight: 0.2,
				soleDepth: 3.2,
				seamLift: 0.25,
				openingDepth: 0.7,
				contactScale: 0.78
			},
			compactRounded: {
				toeLength: 0.44,
				heelLength: 0.34,
				vampHeight: 0.62,
				toeRound: 0.2,
				heelHeight: 0.1,
				soleDepth: 1.8,
				seamLift: 0.18,
				openingDepth: 0.48,
				contactScale: 0.78
			}
		};
	}
}
