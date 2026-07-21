// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceFaceIdentity } from './SkepticalReferenceFaceIdentity.js';
import { SkepticalReferenceHeadStyle } from './SkepticalReferenceHeadStyle.js';

/**
 * Gevurah gathers Dovid's narrow face, tapered beard, and compressed expression.
 * The Awtsmoos renews every finite control, while Awtsmoos.com preserves his
 * guarded mouth as editable, serializable production anatomy.
 */
export class SkepticalReferenceAppearance {
	static create() {
		return {
			...SkepticalReferenceFaceIdentity.create(),
			...SkepticalReferenceHeadStyle.create(),
			mouthStyle: {
				widthScale: 1.02,
				heightScale: 0.52,
				openScale: 0.7,
				jawScale: 0.62,
				cavityWidthScale: 0.88,
				cavityHeightScale: 0.72,
				asymmetryBias: 0.1,
				smileBias: -0.34,
				verticalOffset: 0.4,
				lineWidth: 1.28,
				lowerLipWidth: 0.82,
				commissures: false
			},
			beardGeometry: {
				massStyle: 'continuous',
				cheekScale: 0.55,
				leftCheekScale: 0.97,
				rightCheekScale: 1.03,
				topOffset: 15,
				topInset: 0.79,
				bridgeDrop: 20,
				bridgeGap: 0.3,
				bridgeValley: 1.9,
				openingWidthScale: 0.92,
				openingPaddingX: 1,
				openingPaddingTop: 1.5,
				openingPaddingBottom: 1.8,
				openingRoundness: 0.75,
				moustacheScale: 0.7,
				moustacheLift: 1.25,
				moustacheWidth: 2.6,
				moustacheArch: 1.5,
				moustacheDrop: 1,
				moustacheGap: 0.7,
				moustacheAsymmetry: 0.18,
				lengthScale: 0.43,
				chinWidth: 17,
				chinOffsetX: 1,
				taper: 0.62,
				bottomRoundness: 0.84,
				lineWidth: 1.3,
				strandOpacity: 0.03
			}
		};
	}
}
