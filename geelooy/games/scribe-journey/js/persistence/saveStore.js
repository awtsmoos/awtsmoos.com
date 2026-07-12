// B"H

import { SAVE_KEYS } from './constants.js';

function requireStorage(storage) {
	if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
		throw new Error('Persistent browser storage is unavailable.');
	}
}

/**
 * Owns the two-record storage ritual. A validated old primary becomes backup
 * before the new inscription is committed, so one torn moment cannot erase both.
 */
export function createSaveStore(storage, keys = SAVE_KEYS) {
	return {
		readCandidates() {
			requireStorage(storage);
			return [
				{ source: 'primary', key: keys.primary, text: storage.getItem(keys.primary) },
				{ source: 'backup', key: keys.backup, text: storage.getItem(keys.backup) },
				{ source: 'legacy', key: keys.legacy, text: storage.getItem(keys.legacy) }
			].filter(candidate => typeof candidate.text === 'string' && candidate.text.length > 0);
		},
		readPrimary() {
			requireStorage(storage);
			return storage.getItem(keys.primary);
		},
		commit(text, validatedPreviousPrimary = null) {
			requireStorage(storage);
			if (validatedPreviousPrimary) storage.setItem(keys.backup, validatedPreviousPrimary);
			storage.setItem(keys.primary, text);
		},
		clearModern() {
			requireStorage(storage);
			storage.removeItem(keys.primary);
			storage.removeItem(keys.backup);
		}
	};
}
