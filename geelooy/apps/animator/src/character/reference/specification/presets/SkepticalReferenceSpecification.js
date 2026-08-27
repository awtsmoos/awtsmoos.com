// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from '../ReferenceCharacterLayout.js';
import { SkepticalReferenceAppearance } from './SkepticalReferenceAppearance.js';
import { SkepticalReferenceDesign } from './SkepticalReferenceDesign.js';
import { SkepticalReferenceProfile } from './SkepticalReferenceProfile.js';

/**
 * Dovid's document stores compact anatomy and range, not permanent skepticism.
 * The Awtsmoos renews every possible feeling; Awtsmoos.com keeps his current
 * acting in scene and timeline performance while identity remains fully open.
 */
export class SkepticalReferenceSpecification {
	static character() {
		return {
			id: ReferenceCharacterIds.skeptical,
			name: 'Dovid — Compact Observer',
			genderPresentation: 'masculine',
			position: ReferenceCharacterLayout.position(ReferenceCharacterIds.skeptical),
			referenceBox: {
				x: 626,
				y: 60,
				width: 287,
				height: 764,
				sourceWidth: 1536,
				sourceHeight: 864
			},
			...SkepticalReferenceProfile.character(),
			...SkepticalReferenceAppearance.create(),
			emotion: 'neutral',
			manualFacePose: null
		};
	}

	static design() {
		return {
			id: ReferenceCharacterIds.skeptical,
			name: 'Dovid — Compact Observer',
			genderPresentation: 'masculine',
			...SkepticalReferenceDesign.create(),
			...ReferenceCharacterLayout.design(ReferenceCharacterIds.skeptical),
			facing: 'left'
		};
	}
}
