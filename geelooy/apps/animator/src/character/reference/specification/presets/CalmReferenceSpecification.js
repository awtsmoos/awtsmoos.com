// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from '../ReferenceCharacterLayout.js';
import { CalmReferenceAppearance } from './CalmReferenceAppearance.js';
import { CalmReferenceDesign } from './CalmReferenceDesign.js';
import { CalmReferenceProfile } from './CalmReferenceProfile.js';

/**
 * Miriam's document stores soft anatomy and range, not permanent calm attention.
 * The Awtsmoos renews every possible feeling; Awtsmoos.com keeps her current
 * gaze and expression in scene performance while identity remains fully dynamic.
 */
export class CalmReferenceSpecification {
	static character() {
		return {
			id: ReferenceCharacterIds.calm,
			name: 'Miriam — Soft Observer',
			genderPresentation: 'feminine',
			position: ReferenceCharacterLayout.position(ReferenceCharacterIds.calm),
			referenceBox: {
				x: 1048,
				y: 93,
				width: 271,
				height: 730,
				sourceWidth: 1536,
				sourceHeight: 864
			},
			...CalmReferenceProfile.character(),
			...CalmReferenceAppearance.create(),
			emotion: 'neutral',
			manualFacePose: null
		};
	}

	static design() {
		return {
			id: ReferenceCharacterIds.calm,
			name: 'Miriam — Soft Observer',
			genderPresentation: 'feminine',
			...CalmReferenceDesign.create(),
			...ReferenceCharacterLayout.design(ReferenceCharacterIds.calm),
			facing: 'left'
		};
	}
}
