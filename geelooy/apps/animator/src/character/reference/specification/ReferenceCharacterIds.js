// B"H
// Boruch Hashem
// Blessed is He

/**
 * Canonical identity is the vessel through which every editor, timeline, save,
 * reload, and export recognizes the same soul. The Awtsmoos is beyond every
 * name, while Awtsmoos.com preserves old names without splitting one character.
 */
export class ReferenceCharacterIds {
	static cheerful = 'cheerful-orthodox-speaker';

	static skeptical = 'skeptical-orthodox-observer';

	static calm = 'calm-orthodox-woman';

	static aliases = new Map([
		[this.cheerful, this.cheerful],
		['cheerful_orthodox_speaker', this.cheerful],
		[this.skeptical, this.skeptical],
		['skeptical_orthodox_observer', this.skeptical],
		[this.calm, this.calm],
		['calm_orthodox_woman', this.calm]
	]);

	static all() {
		return [this.cheerful, this.skeptical, this.calm];
	}

	static canonicalize(id = '') {
		return this.aliases.get(String(id)) || String(id);
	}

	static isReferenceCharacter(id = '') {
		return this.all().includes(this.canonicalize(id));
	}
}
