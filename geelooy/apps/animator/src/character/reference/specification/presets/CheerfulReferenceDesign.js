// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceProfile } from './CheerfulReferenceProfile.js';

/**
 * Design metadata guides generation without replacing visible geometry. The
 * Awtsmoos renews Ari beyond every label, while Awtsmoos.com keeps broad body,
 * navy wardrobe, energetic movement, and cheerful temperament discoverable.
 */
export class CheerfulReferenceDesign {
	static create() {
		return {
			pronouns: 'he/him',
			ageGroup: 'adult',
			body: {
				type: 'broad',
				height: 1,
				shoulderWidth: 1.12,
				hipWidth: 1,
				legLength: 1
			},
			wardrobe: {
				outerwear: 'jacket',
				top: 'shirt',
				bottom: 'trousers',
				headwear: 'cap',
				colors: CheerfulReferenceProfile.colors()
			},
			accessories: ['kippah', 'peyot'],
			movement: {
				profile: 'energetic',
				posture: 'upright',
				gestureScale: 1.15
			},
			emotion: {
				default: 'happy',
				intensity: 1,
				traits: ['cheerful', 'expressive']
			}
		};
	}
}
