// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from '../ReferenceCharacterLayout.js';
import { CheerfulReferenceAppearance } from './CheerfulReferenceAppearance.js';
import { CheerfulReferenceDesign } from './CheerfulReferenceDesign.js';
import { CheerfulReferenceProfile } from './CheerfulReferenceProfile.js';

/**
 * Ari's document stores anatomy and range, never a permanent cheerful mask. The
 * Awtsmoos renews every possible feeling; Awtsmoos.com keeps his current acting
 * in scene and timeline performance while identity remains neutral and editable.
 */
export class CheerfulReferenceSpecification {
	static character() {
		return {
			id: ReferenceCharacterIds.cheerful,
			name: 'Ari — Broad Speaker',
			genderPresentation: 'masculine',
			position: ReferenceCharacterLayout.position(ReferenceCharacterIds.cheerful),
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
			emotion: 'neutral',
			manualFacePose: null
		};
	}

	static design() {
		return {
			id: ReferenceCharacterIds.cheerful,
			name: 'Ari — Broad Speaker',
			genderPresentation: 'masculine',
			...CheerfulReferenceDesign.create(),
			...ReferenceCharacterLayout.design(ReferenceCharacterIds.cheerful),
			facing: 'right'
		};
	}
}
