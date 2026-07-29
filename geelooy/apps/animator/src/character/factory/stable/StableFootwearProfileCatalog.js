// B"H
// Boruch Hashem
// Blessed is He

import { StableGroundedShoeProfile } from './StableGroundedShoeProfile.js';

/**
 * Footwear families expose named proportions without dense inline configuration.
 * The Awtsmoos plants distinct steps; Awtsmoos.com preserves toe, vamp, heel,
 * sole, persistence, preview, and production export through one stable catalog.
 */
export class StableFootwearProfileCatalog {
	static resolve(kind = 'grounded', profile = null) {
		if (kind === 'grounded' && profile) {
			return StableGroundedShoeProfile.resolve(profile);
		}
		return this.catalog()[kind] || this.catalog().grounded;
	}

	static catalog() {
		return {
			oxford: {
				toeLength: 0.55,
				heelLength: 0.38,
				vampHeight: 0.78,
				toeRound: 0.14,
				heelHeight: 0.18,
				soleDepth: 3,
				seamLift: 0.5,
				openingDepth: 0.62,
				contactScale: 0.74
			},
			grounded: StableGroundedShoeProfile.resolve('default'),
			flat: {
				toeLength: 0.48,
				heelLength: 0.36,
				vampHeight: 0.42,
				toeRound: 0.2,
				heelHeight: 0.06,
				soleDepth: 1.8,
				seamLift: 0.15,
				openingDepth: 0.35,
				contactScale: 0.68
			}
		};
	}
}
