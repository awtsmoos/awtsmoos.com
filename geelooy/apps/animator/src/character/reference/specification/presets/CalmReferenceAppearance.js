// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceFaceIdentity } from './CalmReferenceFaceIdentity.js';
import { CalmReferenceHeadStyle } from './CalmReferenceHeadStyle.js';

/**
 * Malchus receives Miriam's separate rose lips as a small controlled speaking
 * contour. The Awtsmoos renews every finite articulation, while Awtsmoos.com
 * preserves her editable, keyframeable, serializable production identity.
 */
export class CalmReferenceAppearance {
	static create() {
		return {
			...CalmReferenceFaceIdentity.create(),
			...CalmReferenceHeadStyle.create(),
			mouthStyle: {
				kind: 'rose_lips',
				lipColor: '#a9555b',
				tongueColor: '#d98382',
				widthScale: 0.72,
				heightScale: 0.56,
				openScale: 0.68,
				jawScale: 0.58,
				cavityWidthScale: 0.82,
				cavityHeightScale: 0.74,
				lipThickness: 1,
				asymmetryBias: 0.025,
				smileBias: 0.12,
				upperLiftScale: 0.9,
				lowerDropScale: 0.8,
				lineWidth: 1.05,
				lowerLipWidth: 1.2,
				horizontalOffset: 0.4,
				verticalOffset: 1.4
			}
		};
	}
}
