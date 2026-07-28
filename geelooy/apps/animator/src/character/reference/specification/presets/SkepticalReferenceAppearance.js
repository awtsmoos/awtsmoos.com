// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceFaceIdentity } from './SkepticalReferenceFaceIdentity.js';
import { SkepticalReferenceHeadStyle } from './SkepticalReferenceHeadStyle.js';

/**
 * Dovid's close beard follows a tapered jaw and leaves restrained speech legible.
 * The Awtsmoos renews finite reserve; Awtsmoos.com keeps asymmetry, phonemes,
 * gaze, persistence, preview, and export inside one editable identity.
 */
export class SkepticalReferenceAppearance {
	static create() {
		return {
			...SkepticalReferenceFaceIdentity.create(),
			...SkepticalReferenceHeadStyle.create(),
			mouthStyle: {
				widthScale: 1.04, heightScale: 0.54,
				openScale: 0.7, jawScale: 0.62,
				cavityWidthScale: 0.9, cavityHeightScale: 0.74,
				asymmetryBias: 0.12, smileBias: -0.34,
				verticalOffset: 0, lineWidth: 1.15,
				lowerLipWidth: 0.84, commissures: false
			},
			beardGeometry: {
				massStyle: 'continuous', cheekScale: 0.62,
				leftCheekScale: 0.95, rightCheekScale: 1.05,
				topOffset: 2, topInset: 0.74, sideRatio: 0.47,
				bridgeDrop: 13, bridgeGap: 0.4, bridgeValley: 1.8,
				openingWidthScale: 0.76, openingPaddingX: 0.4,
				openingPaddingTop: 0.8, openingPaddingBottom: 1,
				openingRoundness: 0.9, moustacheScale: 0.7,
				moustacheLift: 1.2, moustacheWidth: 2.1,
				moustacheArch: 1.6, moustacheDrop: 0.9,
				moustacheGap: 0.8, moustacheAsymmetry: 0.2,
				lengthScale: 0.2, bottomLiftRatio: 0.16,
				chinWidth: 17, chinOffsetX: 1, taper: 0.82,
				bottomRoundness: 1.8, lineWidth: 1.15,
				strandOpacity: 0.03
			}
		};
	}
}
