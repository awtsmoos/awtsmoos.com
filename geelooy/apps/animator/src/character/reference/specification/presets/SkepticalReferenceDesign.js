// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceProfile } from './SkepticalReferenceProfile.js';

/**
 * Design metadata describes Dovid without replacing his visible articulated
 * body. The Awtsmoos renews guarded attention, while Awtsmoos.com keeps his
 * burgundy wardrobe, grounded movement, and skeptical temperament discoverable.
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
				profile: 'calm',
				posture: 'grounded',
				gestureScale: 0.76
			},
			emotion: {
				default: 'skeptical',
				intensity: 0.9,
				traits: ['guarded', 'observant']
			}
		};
	}
}
