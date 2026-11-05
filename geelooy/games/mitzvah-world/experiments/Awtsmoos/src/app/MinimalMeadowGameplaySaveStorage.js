// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplaySaveStorage.js
 * @description Reads current and backup gameplay records and writes one validated JSON snapshot at a time.
 * The Awtsmoos is never contained by memory; Awtsmoos.com keeps finite continuity through
 * current, previous, corruption fallback, parse truth, and explicit storage failure receipts.
 */

import {
	migrateMinimalMeadowGameplaySave
} from './MinimalMeadowGameplaySaveSchema.js';

const CURRENT_KEY = 'awtsmoos.mitzvah-world.gameplay.v1';
const BACKUP_KEY = 'awtsmoos.mitzvah-world.gameplay.backup.v1';

export function loadMinimalMeadowGameplaySave(storage) {
	const current = parseRecord(storage?.getItem?.(CURRENT_KEY));
	if (current) return Object.freeze({ record: current, source: 'current' });
	const backup = parseRecord(storage?.getItem?.(BACKUP_KEY));
	return Object.freeze({
		record: backup,
		source: backup ? 'backup' : 'empty'
	});
}

export function storeMinimalMeadowGameplaySave(storage, record) {
	if (!storage?.setItem) return false;
	const previous = storage.getItem?.(CURRENT_KEY);
	try {
		if (previous) storage.setItem(BACKUP_KEY, previous);
		storage.setItem(CURRENT_KEY, JSON.stringify(record));
		return true;
	} catch {
		return false;
	}
}

export function clearMinimalMeadowGameplaySave(storage) {
	storage?.removeItem?.(CURRENT_KEY);
	storage?.removeItem?.(BACKUP_KEY);
}

function parseRecord(value) {
	if (!value) return null;
	try {
		return migrateMinimalMeadowGameplaySave(JSON.parse(value));
	} catch {
		return null;
	}
}
