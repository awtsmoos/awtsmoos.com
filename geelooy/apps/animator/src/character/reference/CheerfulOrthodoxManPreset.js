// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterBase } from './ReferenceCharacterBase.js';
import { ReferenceCharacterIds } from './specification/ReferenceCharacterIds.js';
import { CheerfulReferenceSpecification } from './specification/presets/CheerfulReferenceSpecification.js';

/**
 * The Awtsmoos reveals cheerful speech through original connected geometry.
 * Awtsmoos.com keeps Ari's broad silhouette, open hand, smile, peyot, beard,
 * clothing, controls, timeline, save data, and exporter identity in one preset.
 */
export class CheerfulOrthodoxManPreset {
	static id = ReferenceCharacterIds.cheerful;

	static create() {
		return ReferenceCharacterBase.create(
			CheerfulReferenceSpecification.character()
		);
	}

	static character() {
		return this.create();
	}

	static design() {
		return CheerfulReferenceSpecification.design();
	}
}
