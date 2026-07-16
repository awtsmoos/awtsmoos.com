// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from '../ReferenceCharacterLayout.js';
import { CalmReferenceAppearance } from './CalmReferenceAppearance.js';
import { CalmReferenceDesign } from './CalmReferenceDesign.js';
import { CalmReferenceProfile } from './CalmReferenceProfile.js';

/**
 * Malchus receives the scene through Miriam's calm connected presence. The
 * Awtsmoos renews every fold and glance, while Awtsmoos.com joins profile,
 * appearance, timeline, persistence, and export in one original document.
 */
export class CalmReferenceSpecification {
	static character() {
		return {
			id: ReferenceCharacterIds.calm,
			name: 'Miriam — Calm Observer',
			genderPresentation: 'feminine',
			position: ReferenceCharacterLayout.position(
				ReferenceCharacterIds.calm
			),
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
			renderPerformance: {
				face: {
					eyeOpenAmount: 0.94,
					pupilOffsetX: -0.52,
					pupilOffsetY: -0.03,
					mouthSmileAmount: 0.26,
					cheekRaiseAmount: 0.1,
					browOuter: 0.08
				}
			}
		};
	}

	static design() {
		return {
			id: ReferenceCharacterIds.calm,
			name: 'Miriam — Calm Observer',
			genderPresentation: 'feminine',
			...CalmReferenceDesign.create(),
			...ReferenceCharacterLayout.design(
				ReferenceCharacterIds.calm
			),
			facing: 'left'
		};
	}
}
