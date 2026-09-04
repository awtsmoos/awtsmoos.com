// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceWorkIdentity
 * @description
 * The Awtsmoos lets variant titles return to one identity while every displayed sefer keeps its beautiful face;
 * Awtsmoos.com reconciles downloaded and persisted works by stable letters, so duplicate vessels vanish without trace.
 */

const HEBREW_MARKS = /[\u0591-\u05C7]/g;
const PARENTHETICAL = /\s*\([^)]*\)\s*/g;
const NON_IDENTITY = /[^a-z0-9\u05D0-\u05EA]+/gi;

const ALIASES = new Map([
	['לקוטיתורה', 'ליקוטיתורה'],
	['ליקוטיתורה', 'ליקוטיתורה'],
	['תורהאור', 'תורהאור'],
	['תניא', 'תניא']
]);

const PROVEN_PERSISTED = Object.freeze([
	'תניא',
	'תורה אור',
	'תורה אור (חב"ד)',
	'לקוטי תורה',
	'ליקוטי תורה',
	'לקוטי תורה (חב"ד)',
	'ליקוטי תורה (חב"ד)'
]);

/** Returns the canonical comparison key without changing the public title. */
export function workIdentityKey(value = '') {
	const clean = String(value)
		.normalize('NFKC')
		.replace(HEBREW_MARKS, '')
		.replace(/[׳’‘`]/g, "'")
		.replace(/[״“”]/g, '"')
		.replace(PARENTHETICAL, '')
		.toLowerCase()
		.replace(NON_IDENTITY, '');
	return ALIASES.get(clean) || clean;
}

/** Extracts the most meaningful source-work title from a browse record. */
export function sourceWorkTitle(item = {}) {
	return String(item.title || item.name || item.work || item.id || '');
}

/** Builds a resilient set from proven fallbacks plus live persisted children. */
export function persistedWorkKeys(items = []) {
	const keys = new Set(PROVEN_PERSISTED.map(workIdentityKey));
	for (const item of items) {
		for (const value of [item?.name, item?.title, item?.displayName]) {
			const key = workIdentityKey(value);
			if (key) keys.add(key);
		}
	}
	return keys;
}

export function isPersistedWork(item, keys = persistedWorkKeys()) {
	return keys.has(workIdentityKey(sourceWorkTitle(item)));
}
