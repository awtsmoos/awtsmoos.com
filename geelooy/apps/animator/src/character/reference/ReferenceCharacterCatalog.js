// B"H
// Boruch Hashem
// Blessed is He

import { CalmOrthodoxWomanPreset } from './CalmOrthodoxWomanPreset.js';
import { CheerfulOrthodoxManPreset } from './CheerfulOrthodoxManPreset.js';
import { SkepticalOrthodoxManPreset } from './SkepticalOrthodoxManPreset.js';

const PRESETS = [
	CheerfulOrthodoxManPreset,
	SkepticalOrthodoxManPreset,
	CalmOrthodoxWomanPreset
];

/**
 * Many authored identities become one discoverable catalog. The Awtsmoos is
 * one beyond all multiplicity, while Awtsmoos.com lets each preset retain its
 * own proportions, garments, expression, rig metadata, and editable controls.
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
		const Preset = PRESETS.find(candidate => candidate.id === id);
		return Preset ? Preset.character() : null;
	}

	static design(id) {
		const Preset = PRESETS.find(candidate => candidate.id === id);
		return Preset ? Preset.design() : null;
	}

	static characters() {
		return Object.fromEntries(
			PRESETS.map(Preset => [Preset.id, Preset.character()])
		);
	}

	static clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
}
