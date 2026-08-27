// B"H
// Boruch Hashem
// Blessed is He

import { CalmOrthodoxWomanPreset } from './CalmOrthodoxWomanPreset.js';
import { CheerfulOrthodoxManPreset } from './CheerfulOrthodoxManPreset.js';
import { ReferenceCharacterMigration } from './ReferenceCharacterMigration.js';
import { ReferenceCharacterIds } from './specification/ReferenceCharacterIds.js';
import { SkepticalOrthodoxManPreset } from './SkepticalOrthodoxManPreset.js';

const PRESETS = [
	CheerfulOrthodoxManPreset,
	SkepticalOrthodoxManPreset,
	CalmOrthodoxWomanPreset
];

/**
 * Many authored identities become one discoverable catalog. The Awtsmoos is
 * one beyond multiplicity, while Awtsmoos.com preserves canonical IDs, legacy
 * aliases, proportions, garments, rig controls, timelines, and saved edits.
 */
export class ReferenceCharacterCatalog {
	static list() {
		return PRESETS.map(Preset => ({
			id: Preset.id,
			name: Preset.character().name,
			character: Preset.character(),
			design: Preset.design()
		}));
	}

	static character(id) {
		const Preset = this.preset(id);
		return Preset ? Preset.character() : null;
	}

	static design(id) {
		const Preset = this.preset(id);
		return Preset ? Preset.design() : null;
	}

	static characters() {
		return Object.fromEntries(
			PRESETS.map(Preset => [Preset.id, Preset.character()])
		);
	}

	static migrate(character = {}) {
		const canonicalId = ReferenceCharacterIds.canonicalize(character.id);
		return ReferenceCharacterMigration.migrate(
			{ ...character, id: canonicalId },
			this.character(canonicalId)
		);
	}

	static migrateMap(characters = {}) {
		return Object.fromEntries(
			Object.values(characters || {}).map(character => {
				const migrated = this.migrate(character);
				return [migrated.id, migrated];
			})
		);
	}

	static preset(id) {
		const canonicalId = ReferenceCharacterIds.canonicalize(id);
		return PRESETS.find(candidate => candidate.id === canonicalId) || null;
	}

	static clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
}
