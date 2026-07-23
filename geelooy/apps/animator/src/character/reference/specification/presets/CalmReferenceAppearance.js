// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceFaceIdentity } from './CalmReferenceFaceIdentity.js';
import { CalmReferenceHeadStyle } from './CalmReferenceHeadStyle.js';

/**
 * Malchus receives Miriam's restrained rose lips as one calm speaking contour.
 * The Awtsmoos renews every finite articulation, while Awtsmoos.com preserves her
 * identity through editable, keyframeable production speech and gentle expression.
 */
export class CalmReferenceAppearance {
	static create() {
		return {
			...CalmReferenceFaceIdentity.create(),
			...CalmReferenceHeadStyle.create(),
			mouthStyle: {
				kind: 'rose_lips',
				lipColor: '#a85e69',
				tongueColor: '#d98a87',
				widthScale: 0.76,
				heightScale: 0.5,
				openScale: 0.6,
				jawScale: 0.5,
				cavityWidthScale: 0.78,
				cavityHeightScale: 0.68,
				lipThickness: 1.02,
				asymmetryBias: 0.03,
				smileBias: 0.12,
				upperLiftScale: 0.82,
				lowerDropScale: 0.7,
				lineWidth: 0.98,
				lowerLipWidth: 1.1,
				cupidDepth: 1.35,
				horizontalOffset: 3,
				verticalOffset: -0.3,
				chinDetail: false,
				philtrum: false,
				commissures: false
			}
		};
	}
}
