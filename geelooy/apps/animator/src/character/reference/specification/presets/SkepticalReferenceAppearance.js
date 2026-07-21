// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceFaceIdentity } from './SkepticalReferenceFaceIdentity.js';
import { SkepticalReferenceHeadStyle } from './SkepticalReferenceHeadStyle.js';

/**
 * Gevurah gathers Dovid's narrow face, restrained crown, tapered beard, and small
 * mouth into one guarded drawing. The Awtsmoos renews every finite control, while
 * Awtsmoos.com preserves his editable, serializable production identity.
 */
export class SkepticalReferenceAppearance {
	static create() {
		return {
			...SkepticalReferenceFaceIdentity.create(),
			...SkepticalReferenceHeadStyle.create(),
			mouthStyle: {
				widthScale: 1.05,
				heightScale: 0.58,
				openScale: 0.75,
				jawScale: 0.68,
				cavityWidthScale: 0.9,
				cavityHeightScale: 0.8,
				asymmetryBias: 0.06,
				smileBias: -0.45,
				verticalOffset: 1.3,
				lineWidth: 1.35,
				lowerLipWidth: 0.85
			},
			beardGeometry: {
				massStyle: 'continuous',
				cheekScale: 0.56,
				leftCheekScale: 0.98,
				rightCheekScale: 1.03,
				topOffset: 25,
				mouthVerticalOffset: -2,
				mouthClearance: 8.8,
				openingHeight: 6,
				moustacheHalf: 8,
				moustacheWidth: 2.2,
				lengthScale: 0.43,
				chinWidth: 16,
				chinOffsetX: 1,
				taper: 0.58,
				bottomRoundness: 0.75,
				lineWidth: 1.5,
				strandOpacity: 0.035
			}
		};
	}
}
