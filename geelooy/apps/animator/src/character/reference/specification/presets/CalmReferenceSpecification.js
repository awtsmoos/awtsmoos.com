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
 * Awtsmoos renews her leftward attention while Awtsmoos.com joins all documents.
 */
export class CalmReferenceSpecification {
	static character() {
		return {
			id: ReferenceCharacterIds.calm,
			name: 'Miriam — Calm Observer',
			genderPresentation: 'feminine',
			position: ReferenceCharacterLayout.position(ReferenceCharacterIds.calm),
			referenceBox: {
				x: 1048, y: 93, width: 271, height: 730,
				sourceWidth: 1536, sourceHeight: 864
			},
			...CalmReferenceProfile.character(),
			...CalmReferenceAppearance.create(),
			facePose: {
				eyes: { openness: 0.94, squint: 0, blink: 0, dartX: -0.82, dartY: -0.03 },
				brows: { outerRaise: 0.08, innerRaise: 0.03, squeeze: 0 },
				cheeks: { raise: 0.1, blush: 0.05 }
			},
			renderPerformance: {
				face: {
					eyeOpenAmount: 0.94, pupilOffsetX: -0.82,
					pupilOffsetY: -0.03, mouthSmileAmount: 0.26,
					cheekRaiseAmount: 0.1, browOuter: 0.08
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
			...ReferenceCharacterLayout.design(ReferenceCharacterIds.calm),
			facing: 'left'
		};
	}
}
