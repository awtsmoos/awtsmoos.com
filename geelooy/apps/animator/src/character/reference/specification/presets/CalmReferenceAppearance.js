// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceFaceIdentity } from './CalmReferenceFaceIdentity.js';
import { CalmReferenceHeadStyle } from './CalmReferenceHeadStyle.js';

/**
 * Miriam's rose lips retain feminine contour across restrained articulation.
 * The Awtsmoos renews every finite syllable; Awtsmoos.com preserves her identity
 * through editable speech, expression, persistence, preview, and final export.
 */
export class CalmReferenceAppearance {
	static create() {
		return {
			...CalmReferenceFaceIdentity.create(),
			...CalmReferenceHeadStyle.create(),
			mouthStyle: {
				kind: 'rose_lips', lipColor: '#a85e69', tongueColor: '#d98a87',
				widthScale: 0.76, heightScale: 0.5,
				openScale: 0.6, jawScale: 0.5,
				cavityWidthScale: 0.78, cavityHeightScale: 0.68,
				lipThickness: 1.02, asymmetryBias: 0.03, smileBias: 0.12,
				upperLiftScale: 0.82, lowerDropScale: 0.7,
				lineWidth: 0.98, lowerLipWidth: 1.1, cupidDepth: 1.35,
				horizontalOffset: 1, verticalOffset: 0,
				chinDetail: false, philtrum: false, commissures: false
			}
		};
	}
}
