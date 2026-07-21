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
				lipColor: '#a95b62',
				tongueColor: '#d98a87',
				widthScale: 0.68,
				heightScale: 0.52,
				openScale: 0.64,
				jawScale: 0.54,
				cavityWidthScale: 0.8,
				cavityHeightScale: 0.72,
				lipThickness: 0.88,
				asymmetryBias: 0.025,
				smileBias: 0.1,
				upperLiftScale: 0.88,
				lowerDropScale: 0.76,
				lineWidth: 0.92,
				lowerLipWidth: 1.12,
				horizontalOffset: 0.4,
				verticalOffset: 1.2
			}
		};
	}
}
