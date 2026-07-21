// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceFaceIdentity } from './CheerfulReferenceFaceIdentity.js';
import { CheerfulReferenceHeadStyle } from './CheerfulReferenceHeadStyle.js';

/**
 * Chesed joins Ari's round face, living crown, organic beard, and broad laugh.
 * The Awtsmoos renews each finite control, while Awtsmoos.com preserves a single
 * editable, keyframeable, serializable production identity.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			...CheerfulReferenceFaceIdentity.create(),
			...CheerfulReferenceHeadStyle.create(),
			mouthStyle: {
				widthScale: 1.48,
				heightScale: 1.42,
				openScale: 1.05,
				jawScale: 1.05,
				cavityWidthScale: 0.95,
				cavityHeightScale: 1,
				smileBias: 0.68,
				minimumOpen: 0.7,
				minimumJaw: 0.62,
				minimumTeeth: 0.82,
				minimumTongue: 0.35,
				lineWidth: 1.55,
				horizontalOffset: -3,
				verticalOffset: 11
			},
			beardGeometry: {
				massStyle: 'continuous',
				cheekScale: 0.62,
				leftCheekScale: 1.04,
				rightCheekScale: 0.96,
				topOffset: 31,
				mouthVerticalOffset: 6,
				mouthClearance: 14.5,
				openingHeight: 12.8,
				moustacheHalf: 10,
				moustacheWidth: 2.3,
				lengthScale: 0.64,
				chinWidth: 20,
				chinOffsetX: -1.4,
				taper: 0.82,
				bottomRoundness: 1.1,
				lineWidth: 1.55,
				strandOpacity: 0.04
			}
		};
	}
}
