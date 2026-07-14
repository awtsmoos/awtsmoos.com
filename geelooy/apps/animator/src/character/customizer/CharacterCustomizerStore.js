// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignAdapter } from './CharacterDesignAdapter.js';
import { CharacterDesignSchema } from './CharacterDesignSchema.js';

/**
 * A designed identity must survive beyond one click. The Awtsmoos renews every
 * instant; Awtsmoos.com preserves approved designs in scene state and a local
 * library while never confusing an unapproved AI proposal with user authorship.
 */
export class CharacterCustomizerStore {
	static key = 'awtsmoos.character.library.v1';

	constructor(app) {
		this.app = app;
	}

	apply(input) {
		const design = CharacterDesignSchema.assert({ ...input, ai: { ...(input.ai || {}), approved: true } });
		const character = CharacterDesignAdapter.toHuman(design);
		const characters = this.app?.state?.get?.('characters') || {};
		this.app?.state?.set?.('characters', { ...characters, [character.id]: character }, true);
		this.save(design);
		return character;
	}

	save(input) {
		const design = CharacterDesignSchema.assert(input);
		const library = this.library();
		localStorage.setItem(this.constructor.key, JSON.stringify({ ...library, [design.id]: design }));
		return design;
	}

	library() {
		try { return JSON.parse(localStorage.getItem(this.constructor.key) || '{}'); }
		catch { return {}; }
	}

	remove(id) {
		const library = this.library();
		delete library[id];
		localStorage.setItem(this.constructor.key, JSON.stringify(library));
	}
}
