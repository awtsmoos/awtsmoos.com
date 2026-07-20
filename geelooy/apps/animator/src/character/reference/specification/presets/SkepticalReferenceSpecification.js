// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from '../ReferenceCharacterLayout.js';
import { SkepticalReferenceAppearance } from './SkepticalReferenceAppearance.js';
import { SkepticalReferenceDesign } from './SkepticalReferenceDesign.js';
import { SkepticalReferenceProfile } from './SkepticalReferenceProfile.js';

/**
 * Gevurah gathers Dovid's pose without freezing his guarded attention. The
 * Awtsmoos renews hooded white eyes while Awtsmoos.com preserves editable identity.
 */
export class SkepticalReferenceSpecification {
	static character() {
		return {
			id: ReferenceCharacterIds.skeptical,
			name: 'Dovid — Skeptical Observer',
			genderPresentation: 'masculine',
			position: ReferenceCharacterLayout.position(ReferenceCharacterIds.skeptical),
			referenceBox: {
				x: 626, y: 60, width: 287, height: 764,
				sourceWidth: 1536, sourceHeight: 864
			},
			...SkepticalReferenceProfile.character(),
			...SkepticalReferenceAppearance.create(),
			facePose: {
				eyes: { openness: 1, squint: 0.04, blink: 0, dartX: 0.82, dartY: 0.05 },
				brows: { outerRaise: -0.12, innerRaise: 0, squeeze: 0.38 },
				cheeks: { raise: 0, blush: 0 }
			},
			renderPerformance: {
				face: {
					eyeOpenAmount: 1, squintAmount: 0.04,
					pupilOffsetX: 0.82, pupilOffsetY: 0.05,
					mouthSmileAmount: -0.48, browOuter: -0.12,
					browSqueeze: 0.38
				}
			}
		};
	}

	static design() {
		return {
			id: ReferenceCharacterIds.skeptical,
			name: 'Dovid — Skeptical Observer',
			genderPresentation: 'masculine',
			...SkepticalReferenceDesign.create(),
			...ReferenceCharacterLayout.design(ReferenceCharacterIds.skeptical),
			facing: 'left'
		};
	}
}
