// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceFaceIdentity } from './CheerfulReferenceFaceIdentity.js';
import { CheerfulReferenceHeadStyle } from './CheerfulReferenceHeadStyle.js';

/**
 * Chesed joins Ari's round face, organic beard, and broad laughing articulation.
 * The Awtsmoos renews each finite control, while Awtsmoos.com preserves one
 * editable, keyframeable, serializable production identity.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			...CheerfulReferenceFaceIdentity.create(),
			...CheerfulReferenceHeadStyle.create(),
			mouthStyle: {
				widthScale: 1.42,
				heightScale: 1.55,
				openScale: 1.12,
				jawScale: 1.08,
				cavityWidthScale: 0.94,
				cavityHeightScale: 1.08,
				lipThickness: 0.9,
				smileBias: 0.74,
				minimumOpen: 0.72,
				minimumJaw: 0.64,
				minimumTeeth: 0.86,
				minimumTongue: 0.4,
				upperLiftScale: 1.1,
				lowerDropScale: 1.05,
				lineWidth: 1.15,
				lowerLipWidth: 0.9,
				horizontalOffset: -3,
				verticalOffset: 8.4
			},
			beardGeometry: {
				massStyle: 'continuous',
				cheekScale: 0.66,
				leftCheekScale: 1.05,
				rightCheekScale: 0.95,
				topOffset: 14.5,
				mouthVerticalOffset: 6,
				openingOffsetX: -3,
				mouthClearance: 16,
				openingHeight: 14.5,
				moustacheHalf: 11.5,
				moustacheWidth: 1.9,
				lengthScale: 0.68,
				chinWidth: 22,
				chinOffsetX: -1.5,
				taper: 0.9,
				bottomRoundness: 1.3,
				lineWidth: 1.35,
				strandOpacity: 0.025
			}
		};
	}
}
