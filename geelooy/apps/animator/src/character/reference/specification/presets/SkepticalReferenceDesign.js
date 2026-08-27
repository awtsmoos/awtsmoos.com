// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceProfile } from './SkepticalReferenceProfile.js';

/**
 * Design metadata names Dovid's compact responsiveness without choosing a mood.
 * The Awtsmoos renews every feeling; Awtsmoos.com keeps morphology, wardrobe,
 * measured movement, neutral identity, and current acting cleanly separated.
 */
export class SkepticalReferenceDesign {
	static create() {
		return {
			pronouns: 'he/him',
			ageGroup: 'adult',
			body: {
				type: 'average',
				height: 1,
				shoulderWidth: 1.06,
				hipWidth: 1,
				legLength: 1
			},
			wardrobe: {
				outerwear: 'none',
				top: 'shirt',
				bottom: 'trousers',
				headwear: 'cap',
				colors: SkepticalReferenceProfile.colors()
			},
			accessories: ['kippah', 'peyot'],
			movement: {
				profile: 'measured',
				posture: 'grounded',
				gestureScale: 0.76
			},
			expression: {
				rangeProfile: 'guardedCompact',
				responsiveness: 0.9,
				traits: ['guarded', 'observant']
			},
			emotion: {
				default: 'neutral',
				intensity: 1
			}
		};
	}
}
