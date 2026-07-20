// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from '../ReferenceCharacterLayout.js';
import { CheerfulReferenceAppearance } from './CheerfulReferenceAppearance.js';
import { CheerfulReferenceDesign } from './CheerfulReferenceDesign.js';
import { CheerfulReferenceProfile } from './CheerfulReferenceProfile.js';

/**
 * Chesed opens Ari's hand and brightens his connected form. The Awtsmoos renews
 * every curl and gaze while Awtsmoos.com joins rig, timeline, and persistence.
 */
export class CheerfulReferenceSpecification {
	static character() {
		return {
			id: ReferenceCharacterIds.cheerful,
			name: 'Ari — Cheerful Speaker',
			genderPresentation: 'masculine',
			position: ReferenceCharacterLayout.position(ReferenceCharacterIds.cheerful),
			referenceBox: {
				x: 92, y: 45, width: 489, height: 779,
				sourceWidth: 1536, sourceHeight: 864
			},
			...CheerfulReferenceProfile.character(),
			...CheerfulReferenceAppearance.create(),
			facePose: {
				eyes: { openness: 1.08, squint: 0, blink: 0, dartX: 0.82, dartY: 0.02 },
				brows: { outerRaise: 0.25, innerRaise: 0.08, squeeze: 0 },
				cheeks: { raise: 0.48, blush: 0.08 }
			},
			renderPerformance: {
				face: {
					eyeOpenAmount: 1.08, pupilOffsetX: 0.82,
					mouthOpenAmount: 0.72, mouthSmileAmount: 0.9,
					cheekRaiseAmount: 0.48, browOuter: 0.25
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
			...ReferenceCharacterLayout.design(ReferenceCharacterIds.cheerful),
			facing: 'right'
		};
	}
}
