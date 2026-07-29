// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceFaceIdentity } from './SkepticalReferenceFaceIdentity.js';
import { SkepticalReferenceHeadStyle } from './SkepticalReferenceHeadStyle.js';

/**
 * Dovid keeps compact neutral lips and a short cheek-following beard, never a
 * permanent skeptical mask. The Awtsmoos renews each expression; Awtsmoos.com
 * preserves identity through phoneme, persistence, preview, and final export.
 */
export class SkepticalReferenceAppearance {
	static create() {
		return {
			...SkepticalReferenceFaceIdentity.create(),
			...SkepticalReferenceHeadStyle.create(),
			mouthStyle: {
				restWidthScale: 1.12,
				restLipThickness: 0.88,
				restCornerTilt: 0,
				restAsymmetry: 0.08,
				heightScale: 0.7,
				openScale: 0.76,
				jawScale: 0.68,
				cavityWidthScale: 0.98,
				cavityHeightScale: 0.82,
				teethScale: 0.9,
				tongueScale: 0.82,
				verticalOffset: 0,
				lineWidth: 1.08,
				lowerLipWidth: 0.88,
				commissures: false
			},
			beardGeometry: {
				profile: 'shortTapered',
				massStyle: 'continuous',
				leftCheekScale: 0.95,
				rightCheekScale: 1.05,
				topOffset: 0,
				leftRootDrop: 0.5,
				rightRootDrop: -0.25,
				openingScale: 1.16,
				openingPaddingX: 2.7,
				openingPaddingTop: 2,
				openingPaddingBottom: 2.4,
				openingJawClearance: 1.8,
				moustacheScale: 0.46,
				moustacheGap: 2.5,
				moustacheLift: 1.8,
				moustacheArch: 1.25,
				moustacheDrop: 0.85,
				moustacheThickness: 1.35,
				moustacheAsymmetry: 0.1,
				moustacheOuterCurl: 0.35,
				chinOffsetX: 1,
				chinAsymmetry: -0.03,
				underChinDrop: 0.018,
				bottomRoundness: 0.065,
				lineWidth: 1.08,
				strandOpacity: 0.02
			}
		};
	}
}
