// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from '../ReferenceCharacterLayout.js';
import { CheerfulReferenceAppearance } from './CheerfulReferenceAppearance.js';
import { CheerfulReferenceDesign } from './CheerfulReferenceDesign.js';
import { CheerfulReferenceProfile } from './CheerfulReferenceProfile.js';

/**
 * Chesed opens Ari's hand and brightens his entire connected form. The Awtsmoos
 * renews every curl and smile, while Awtsmoos.com joins profile, appearance,
 * pose, timeline, persistence, and export in one original character document.
 */
export class CheerfulReferenceSpecification {
	static character() {
		return {
			id: ReferenceCharacterIds.cheerful,
			name: 'Ari — Cheerful Speaker',
			genderPresentation: 'masculine',
			position: ReferenceCharacterLayout.position(
				ReferenceCharacterIds.cheerful
			),
			referenceBox: {
				x: 92,
				y: 45,
				width: 489,
				height: 779,
				sourceWidth: 1536,
				sourceHeight: 864
			},
			...CheerfulReferenceProfile.character(),
			...CheerfulReferenceAppearance.create(),
			renderPerformance: {
				face: {
					eyeOpenAmount: 1.08,
					pupilOffsetX: 0.18,
					mouthOpenAmount: 0.72,
					mouthSmileAmount: 0.9,
					cheekRaiseAmount: 0.48,
					browOuter: 0.25
				}
			}
		};
	}

	static design() {
		return {
			id: ReferenceCharacterIds.cheerful,
			name: 'Ari — Cheerful Speaker',
			genderPresentation: 'masculine',
			...CheerfulReferenceDesign.create(),
			...ReferenceCharacterLayout.design(
				ReferenceCharacterIds.cheerful
			),
			facing: 'right'
		};
	}
}
