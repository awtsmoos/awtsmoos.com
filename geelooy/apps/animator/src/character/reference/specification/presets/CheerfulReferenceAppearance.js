// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceFaceIdentity } from './CheerfulReferenceFaceIdentity.js';
import { CheerfulReferenceHeadStyle } from './CheerfulReferenceHeadStyle.js';

/**
 * Chesed joins Ari's round face, cheek-grown beard, and generous living laugh.
 * The Awtsmoos renews each finite control, while Awtsmoos.com preserves one
 * editable, keyframeable, serializable production identity.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			...CheerfulReferenceFaceIdentity.create(),
			...CheerfulReferenceHeadStyle.create(),
			mouthStyle: {
				widthScale: 1.44,
				heightScale: 1.38,
				openScale: 1.08,
				jawScale: 1.08,
				cavityWidthScale: 0.98,
				cavityHeightScale: 1,
				smileBias: 0.72,
				minimumOpen: 0.74,
				minimumJaw: 0.7,
				minimumTeeth: 0.86,
				minimumTongue: 0.42,
				lineWidth: 1.42,
				horizontalOffset: -3,
				verticalOffset: 9
			},
			beardGeometry: {
				massStyle: 'continuous',
				cheekScale: 0.62,
				leftCheekScale: 1.04,
				rightCheekScale: 0.96,
				topOffset: 17,
				topInset: 0.8,
				sideRatio: 0.4,
				bridgeDrop: 19,
				bridgeGap: 0.4,
				bridgeValley: 2.2,
				openingWidthScale: 0.88,
				openingPaddingX: 1.4,
				openingPaddingTop: 1.8,
				openingPaddingBottom: 2.4,
				openingRoundness: 0.86,
				moustacheScale: 0.72,
				moustacheLift: 1.5,
				moustacheWidth: 3,
				moustacheArch: 2.2,
				moustacheDrop: 1.2,
				moustacheGap: 0.8,
				moustacheAsymmetry: 0.25,
				lengthScale: 0.62,
				chinWidth: 19,
				chinOffsetX: -1.4,
				taper: 0.74,
				bottomRoundness: 1.18,
				lineWidth: 1.35,
				strandOpacity: 0.035
			}
		};
	}
}
