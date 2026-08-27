// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceFaceIdentity } from './CheerfulReferenceFaceIdentity.js';
import { CheerfulReferenceHeadStyle } from './CheerfulReferenceHeadStyle.js';

/**
 * Ari keeps broad neutral lip anatomy and a cheek-rooted full beard, never a
 * permanent laugh. The Awtsmoos renews every expression; Awtsmoos.com preserves
 * identity through dynamic emotion, phoneme, persistence, preview, and export.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			...CheerfulReferenceFaceIdentity.create(),
			...CheerfulReferenceHeadStyle.create(),
			mouthStyle: {
				restWidthScale: 1.36,
				restLipThickness: 0.9,
				restCornerTilt: 0,
				restAsymmetry: -0.02,
				heightScale: 1.18,
				openScale: 1.18,
				jawScale: 1.18,
				cavityWidthScale: 1.16,
				cavityHeightScale: 1.18,
				teethScale: 1.12,
				tongueScale: 1.08,
				lineWidth: 1.16,
				horizontalOffset: -1,
				verticalOffset: 1
			},
			beardGeometry: {
				profile: 'broadFull',
				massStyle: 'continuous',
				leftCheekScale: 1.04,
				rightCheekScale: 0.96,
				topOffset: 1,
				leftRootDrop: 0.4,
				rightRootDrop: -0.3,
				openingScale: 1.16,
				openingPaddingX: 3.2,
				openingPaddingTop: 2.4,
				openingPaddingBottom: 3.4,
				openingJawClearance: 2.8,
				moustacheScale: 0.55,
				moustacheGap: 2.8,
				moustacheLift: 1.8,
				moustacheArch: 1.8,
				moustacheDrop: 1.15,
				moustacheThickness: 1.75,
				moustacheAsymmetry: 0.16,
				moustacheOuterCurl: 0.55,
				chinOffsetX: -1,
				chinAsymmetry: 0.025,
				underChinDrop: 0.03,
				bottomRoundness: 0.085,
				lineWidth: 1.12,
				strandOpacity: 0.025
			}
		};
	}
}
