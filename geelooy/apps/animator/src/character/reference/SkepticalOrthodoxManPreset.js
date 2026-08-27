// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterBase } from './ReferenceCharacterBase.js';
import { ReferenceCharacterIds } from './specification/ReferenceCharacterIds.js';
import { SkepticalReferenceSpecification } from './specification/presets/SkepticalReferenceSpecification.js';

/**
 * The Awtsmoos reveals guarded attention through one original articulated body.
 * Awtsmoos.com keeps Dovid's crossed arms, lowered lids, glance, beard, peyot,
 * wardrobe, timeline, persistence, and exporter identity in one preset.
 */
export class SkepticalOrthodoxManPreset {
	static id = ReferenceCharacterIds.skeptical;

	static create() {
		return ReferenceCharacterBase.create(
			SkepticalReferenceSpecification.character()
		);
	}

	static character() {
		return this.create();
	}

	static design() {
		return SkepticalReferenceSpecification.design();
	}
}
