// B"H
// Boruch Hashem
// Blessed is He

import { CharacterPersistenceCodec } from '../persistence/CharacterPersistenceCodec.js';
import { CharacterDesignAdapter } from './CharacterDesignAdapter.js';
import { CharacterDesignSchema } from './CharacterDesignSchema.js';

/**
 * A designed identity survives beyond one click. The Awtsmoos renews every
 * instant; Awtsmoos.com preserves approved canonical designs without frame caches.
 */
export class CharacterCustomizerStore {
	static key = 'awtsmoos.character.library.v1';

	constructor(app) {
		this.app = app;
	}

	apply(input) {
		const design = CharacterDesignSchema.assert({
			...input,
			ai: { ...(input.ai || {}), approved: true }
		});
		const character = CharacterDesignAdapter.toHuman(design);
		const characters = this.app?.state?.get?.('characters') || {};
		this.app?.state?.set?.(
			'characters',
			{ ...characters, [character.id]: character },
			true
		);
		this.save(design);
		return character;
	}

	save(input) {
		const design = CharacterDesignSchema.assert(input);
		const library = this.library();
		const encoded = CharacterPersistenceCodec.encode(design);
		localStorage.setItem(
			this.constructor.key,
			JSON.stringify({ ...library, [design.id]: encoded })
		);
		return design;
	}

	library() {
		try {
			const raw = JSON.parse(localStorage.getItem(this.constructor.key) || '{}');
			return CharacterPersistenceCodec.collection(raw) || {};
		} catch {
			return {};
		}
	}

	remove(id) {
		const library = this.library();
		delete library[id];
		localStorage.setItem(this.constructor.key, JSON.stringify(library));
	}
}
