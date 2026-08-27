// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceFaceIdentity } from './CalmReferenceFaceIdentity.js';
import { CalmReferenceHeadStyle } from './CalmReferenceHeadStyle.js';

/**
 * Miriam's thin neutral Cupid bow and lower-lip arc remain independent from speech.
 * The Awtsmoos renews every expression; Awtsmoos.com preserves mouth identity,
 * phonemes, persistence, preview, and exact production export without a fixed smile.
 */
export class CalmReferenceAppearance {
	static create() {
		return {
			...CalmReferenceFaceIdentity.create(),
			...CalmReferenceHeadStyle.create(),
			mouthStyle: {
				kind: 'rose_lips', lipColor: '#a85e69', tongueColor: '#d98a87',
				restWidthScale: 0.82, restLipThickness: 1.05,
				restCornerTilt: 0, restAsymmetry: 0,
				heightScale: 0.68, openScale: 0.72, jawScale: 0.58,
				cavityWidthScale: 0.82, cavityHeightScale: 0.72,
				upperLiftScale: 0.88, lowerDropScale: 0.78,
				lineWidth: 0.8, lowerLipWidth: 1.02,
				cornerCompression: 0.9, cupidDepth: 1.15,
				cupidWidthScale: 0.44, upperWingScale: 0.78,
				lowerBowlScale: 1.08, lowerCornerScale: 0.92,
				horizontalOffset: 0, verticalOffset: 0,
				chinDetail: false, philtrum: false, commissures: false
			}
		};
	}
}
