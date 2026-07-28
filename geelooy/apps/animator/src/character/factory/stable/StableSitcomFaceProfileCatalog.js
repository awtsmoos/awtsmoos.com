// B"H
// Boruch Hashem
// Blessed is He

/**
 * Sitcom identities begin as coherent skull, jaw, and landmark relationships.
 * The Awtsmoos contains every possible face, while Awtsmoos.com offers finite
 * reusable profiles that remain procedural rather than reference-bound artwork.
 */
export class StableSitcomFaceProfileCatalog {
	static resolve(data = {}) {
		const name = data.faceProfile || data.bodyProfile;
		const profile = this.profiles()[name];
		if (!profile || (data.lineStyle !== 'referenceSitcom' && !data.faceProfile)) {
			return {};
		}
		return { ...profile };
	}

	static profiles() {
		return {
			friendlyBroad: {
				widthScale: 1.01, heightScale: 1, headDrop: 8,
				foreheadScale: 0.78, templeScale: 0.9,
				cheekScale: 1.02, cheekYScale: 0.2,
				jawScale: 0.74, jawYScale: 0.7,
				chinScale: 0.44, chinRound: 0.98, chinLift: 0.12,
				topShoulder: 0.5, foreheadTension: 0.94,
				cheekDrop: 1.36, jawOut: 1.01,
				jawApproach: 0.82, jawExit: 0.8,
				eyeYRatio: -0.17, eyeSpreadRatio: 0.44,
				browLiftRatio: 0.23, noseYRatio: 0.08,
				mouthYRatio: 0.34, blushYRatio: 0.2,
				blushSpreadRatio: 0.57, beardRootYRatio: 0.17
			},
			guardedSlim: {
				widthScale: 0.91, heightScale: 0.99, headDrop: 8,
				foreheadScale: 0.79, templeScale: 0.89,
				cheekScale: 0.91, cheekYScale: 0.18,
				jawScale: 0.63, jawYScale: 0.7,
				chinScale: 0.36, chinRound: 0.94, chinLift: 0.13,
				topShoulder: 0.49, foreheadTension: 0.93,
				cheekDrop: 1.34, jawOut: 0.98,
				jawApproach: 0.81, jawExit: 0.78,
				eyeYRatio: -0.17, eyeSpreadRatio: 0.43,
				browLiftRatio: 0.21, noseYRatio: 0.08,
				mouthYRatio: 0.34, blushYRatio: 0.2,
				blushSpreadRatio: 0.56, beardRootYRatio: 0.17
			},
			modestBalanced: {
				widthScale: 0.84, heightScale: 0.94, headDrop: 7,
				foreheadScale: 0.83, templeScale: 0.91,
				cheekScale: 0.94, cheekYScale: 0.18,
				jawScale: 0.7, jawYScale: 0.69,
				chinScale: 0.43, chinRound: 0.96, chinLift: 0.12,
				topShoulder: 0.49, foreheadTension: 0.94,
				cheekDrop: 1.33, jawOut: 0.99,
				jawApproach: 0.82, jawExit: 0.8,
				eyeYRatio: -0.16, eyeSpreadRatio: 0.45,
				browLiftRatio: 0.22, noseYRatio: 0.08,
				mouthYRatio: 0.36, blushYRatio: 0.2,
				blushSpreadRatio: 0.58
			}
		};
	}
}
