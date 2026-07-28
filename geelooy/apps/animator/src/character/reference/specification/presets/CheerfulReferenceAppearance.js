// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceFaceIdentity } from './CheerfulReferenceFaceIdentity.js';
import { CheerfulReferenceHeadStyle } from './CheerfulReferenceHeadStyle.js';

/**
 * Ari's cheek-following beard opens around a broad readable laugh. The Awtsmoos
 * joins finite hair and voice; Awtsmoos.com preserves one editable, keyframeable
 * identity through every expression, phoneme, save, preview, and export.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			...CheerfulReferenceFaceIdentity.create(),
			...CheerfulReferenceHeadStyle.create(),
			mouthStyle: {
				widthScale: 1.62, heightScale: 1.34,
				openScale: 1.16, jawScale: 1.12,
				cavityWidthScale: 1.12, cavityHeightScale: 1.08,
				smileBias: 0.82, minimumOpen: 1, minimumJaw: 0.86,
				minimumTeeth: 0.9, minimumTongue: 0.48,
				lineWidth: 1.18, horizontalOffset: -1, verticalOffset: 1
			},
			beardGeometry: {
				massStyle: 'continuous', cheekScale: 0.62,
				leftCheekScale: 1.05, rightCheekScale: 0.95,
				topOffset: 6, topInset: 0.7, sideRatio: 0.45,
				bridgeDrop: 15, bridgeGap: 0.7, bridgeValley: 2.3,
				openingWidthScale: 0.82, openingPaddingX: 1,
				openingPaddingTop: 1.3, openingPaddingBottom: 1.6,
				openingRoundness: 0.9, moustacheScale: 0.72,
				moustacheLift: 1.2, moustacheWidth: 2.2,
				moustacheArch: 2.2, moustacheDrop: 1,
				moustacheGap: 1, moustacheAsymmetry: 0.28,
				lengthScale: 0.5, chinWidth: 20,
				chinOffsetX: -1, taper: 0.74,
				bottomRoundness: 1.55, lineWidth: 1.12,
				strandOpacity: 0.03
			}
		};
	}
}
