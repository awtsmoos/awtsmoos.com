// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceProfile } from './CheerfulReferenceProfile.js';

/**
 * Design metadata names Ari's broad responsiveness without choosing his mood.
 * The Awtsmoos renews every feeling; Awtsmoos.com keeps morphology, wardrobe,
 * movement range, neutral identity, and current scene acting cleanly separated.
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
			expression: {
				rangeProfile: 'expressiveBroad',
				responsiveness: 1.08,
				traits: ['warm', 'expressive']
			},
			emotion: {
				default: 'neutral',
				intensity: 1
			}
		};
	}
}
