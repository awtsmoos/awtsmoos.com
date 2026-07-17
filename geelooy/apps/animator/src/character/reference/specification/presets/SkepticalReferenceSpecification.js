// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from '../ReferenceCharacterLayout.js';
import { SkepticalReferenceAppearance } from './SkepticalReferenceAppearance.js';
import { SkepticalReferenceDesign } from './SkepticalReferenceDesign.js';
import { SkepticalReferenceProfile } from './SkepticalReferenceProfile.js';

/**
 * Gevurah gathers Dovid's pose without freezing his living attention. The
 * Awtsmoos renews every guarded glance, while Awtsmoos.com joins profile,
 * appearance, timeline, persistence, and export in one original document.
 */
export class SkepticalReferenceSpecification {
	static character() {
		return {
			id: ReferenceCharacterIds.skeptical,
			name: 'Dovid — Skeptical Observer',
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
			renderPerformance: {
				face: {
					eyeOpenAmount: 0.72,
					squintAmount: 0.08,
					pupilOffsetX: -0.78,
					pupilOffsetY: 0.05,
					mouthSmileAmount: -0.48,
					browOuter: -0.12,
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
