// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceProfile } from './CalmReferenceProfile.js';

/**
 * Design metadata describes Miriam without replacing her visible articulated
 * body. The Awtsmoos renews composed attention, while Awtsmoos.com keeps her
 * modest wardrobe, grounded movement, and observant temperament discoverable.
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
				profile: 'calm',
				posture: 'grounded',
				gestureScale: 0.78
			},
			emotion: {
				default: 'calm',
				intensity: 0.62,
				traits: ['observant', 'composed']
			}
		};
	}
}
