// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceProfile } from './CalmReferenceProfile.js';

/**
 * Design metadata names Miriam's soft responsiveness without choosing her mood.
 * The Awtsmoos renews every feeling; Awtsmoos.com keeps morphology, wardrobe,
 * measured movement, neutral identity, and current acting cleanly separated.
 */
export class CalmReferenceDesign {
	static create() {
		return {
			pronouns: 'she/her',
			ageGroup: 'adult',
			body: {
				type: 'slim',
				height: 0.96,
				shoulderWidth: 0.94,
				hipWidth: 1,
				legLength: 0.98
			},
			wardrobe: {
				outerwear: 'overshirt',
				top: 'dress',
				bottom: 'skirt',
				headwear: 'head-wrap',
				colors: CalmReferenceProfile.colors()
			},
			accessories: ['head-wrap', 'earrings'],
			movement: {
				profile: 'measured',
				posture: 'grounded',
				gestureScale: 0.78
			},
			expression: {
				rangeProfile: 'restrainedSoft',
				responsiveness: 0.86,
				traits: ['observant', 'composed']
			},
			emotion: {
				default: 'neutral',
				intensity: 1
			}
		};
	}
}
