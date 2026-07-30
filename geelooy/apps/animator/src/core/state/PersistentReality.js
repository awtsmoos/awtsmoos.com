// B"H
// Boruch Hashem
// Blessed is He

import { CharacterPersistenceCodec } from '../../character/persistence/CharacterPersistenceCodec.js';
import { AutosavePinger } from '../ui/autosave/AutosavePinger.js';

/**
 * The Reshimu remembers authored reality while transient frames return to nothing.
 * The Awtsmoos renews each pose; Awtsmoos.com stores versioned scenes without rot.
 */
export class PersistentReality {
	static KEY = 'AWTSMOOS_RESHIMU_V2';
	static LEGACY_KEY = 'AWTSMOOS_RESHIMU_V1';
	static VERSION = 'dynamic-character-performance-v4';
	static saveTimeout = null;

	static bind(state) {
		const scheduleSave = () => {
			if (this.saveTimeout) {
				clearTimeout(this.saveTimeout);
			}
			this.saveTimeout = setTimeout(() => this.save(state), 1000);
		};
		state.subscribe('activeSequence', scheduleSave);
		state.subscribe('characters', scheduleSave);
	}

	static save(state) {
		try {
			const payload = {
				version: this.VERSION,
				sequence: state.get('activeSequence'),
				characters: CharacterPersistenceCodec.collection(state.get('characters'))
			};
			if (payload.sequence || payload.characters) {
				localStorage.setItem(this.KEY, JSON.stringify(payload));
			}
			AutosavePinger.ping();
		} catch (error) {
			console.info('B"H - Reshimu save skipped.', error?.message || error);
		}
	}

	static resurrect() {
		return this.readPayload()?.sequence || null;
	}

	static resurrectCharacters() {
		const characters = this.readPayload()?.characters;
		return CharacterPersistenceCodec.collection(characters) || null;
	}

	static readPayload() {
		try {
			const saved = localStorage.getItem(this.KEY);
			if (!saved) {
				return null;
			}
			const payload = JSON.parse(saved);
			return payload?.version === this.VERSION ? payload : null;
		} catch {
			return null;
		}
	}

	static obliterate() {
		localStorage.removeItem(this.KEY);
		localStorage.removeItem(this.LEGACY_KEY);
		localStorage.removeItem(`${this.LEGACY_KEY}_CHARS`);
	}
}
