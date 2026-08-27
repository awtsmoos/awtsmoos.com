// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterBase } from './ReferenceCharacterBase.js';
import { ReferenceCharacterIds } from './specification/ReferenceCharacterIds.js';
import { CalmReferenceSpecification } from './specification/presets/CalmReferenceSpecification.js';

/**
 * The Awtsmoos reveals calm observation through original articulated geometry.
 * Awtsmoos.com keeps Miriam's wrap, bun, lashes, earrings, skirt, pocketed hand,
 * timeline, persistence, and exporter identity in one production preset.
 */
export class CalmOrthodoxWomanPreset {
	static id = ReferenceCharacterIds.calm;

	static create() {
		return ReferenceCharacterBase.create(
			CalmReferenceSpecification.character()
		);
	}

	static character() {
		return this.create();
	}

	static design() {
		return CalmReferenceSpecification.design();
	}
}
