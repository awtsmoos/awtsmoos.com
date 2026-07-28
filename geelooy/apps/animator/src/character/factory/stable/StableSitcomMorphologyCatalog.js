// B"H
// Boruch Hashem
// Blessed is He

/**
 * Reusable builds describe human proportion without hard-coding one character.
 * The Awtsmoos contains every difference; Awtsmoos.com offers finite sitcom
 * silhouettes that remain editable starting points instead of finished sprites.
 */
export class StableSitcomMorphologyCatalog {
	static resolve(data = {}) {
		if (data.sitcomMorphology) {
			return data.sitcomMorphology;
		}
		if (data.lineStyle !== 'referenceSitcom') {
			return null;
		}
		return this.profiles()[data.bodyProfile] || this.profiles().friendlyAverage;
	}

	static profiles() {
		return {
			friendlyBroad: {
				shoulderScale: 0.86,
				chestScale: 0.98,
				waistScale: 0.9,
				hipScale: 0.96,
				shoulderDrop: 5,
				leftShoulderDrop: 7,
				rightShoulderDrop: 5,
				shoulderSlope: 8,
				shoulderRound: 9,
				ribRound: 4,
				sideRound: 4,
				belly: 1,
				legScale: 1.12,
				shoeScaleX: 0.72,
				shoeScaleY: 0.54
			},
			guardedSlim: {
				shoulderScale: 0.82,
				chestScale: 0.94,
				waistScale: 0.9,
				hipScale: 0.98,
				shoulderDrop: 5,
				leftShoulderDrop: 6,
				rightShoulderDrop: 4,
				shoulderSlope: 8,
				shoulderRound: 8,
				ribRound: 3,
				sideRound: 3,
				legScale: 1.08,
				shoeScaleX: 0.68,
				shoeScaleY: 0.52
			},
			modestBalanced: {
				shoulderScale: 0.8,
				chestScale: 0.9,
				waistScale: 0.9,
				hipScale: 1.05,
				centerX: -2,
				shoulderDrop: 4,
				leftShoulderDrop: 5,
				rightShoulderDrop: 3,
				shoulderSlope: 9,
				shoulderRound: 8,
				ribRound: 3,
				sideRound: 3,
				legScale: 1,
				shoeScaleX: 0.58,
				shoeScaleY: 0.46
			},
			friendlyAverage: {
				shoulderScale: 0.88,
				chestScale: 0.94,
				waistScale: 0.9,
				hipScale: 0.98,
				shoulderDrop: 5,
				shoulderSlope: 8,
				shoulderRound: 9,
				ribRound: 4,
				sideRound: 4
			}
		};
	}
}
