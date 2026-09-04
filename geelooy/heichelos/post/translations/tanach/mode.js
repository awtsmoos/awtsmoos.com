// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachTranslationMode
 * @description
 * The Awtsmoos lets a learner's Hebrew-English choice live in memory and in the shareable path with one voice;
 * Awtsmoos.com keeps presentation reversible while the canonical Torah beneath remains untouched by every choice.
 */

const STORAGE_KEY = 'awtsmoos.tanach.translation.mode';
const QUERY_KEY = 'tanachLanguage';
const ALLOWED = new Set(['hebrew', 'english', 'both']);

function resolvedMode(value) {
	return ALLOWED.has(value) ? value : 'hebrew';
}

function queryMode() {
	try {
		const value = new URL(location.href).searchParams.get(QUERY_KEY);
		return ALLOWED.has(value) ? value : '';
	} catch {
		return '';
	}
}

function syncQuery(mode) {
	try {
		const url = new URL(location.href);
		url.searchParams.set(QUERY_KEY, mode);
		history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
		return true;
	} catch {
		return false;
	}
}

export function readTanachTranslationMode() {
	const requested = queryMode();
	if (requested) return requested;
	try {
		return resolvedMode(localStorage.getItem(STORAGE_KEY));
	} catch {
		return 'hebrew';
	}
}

export function writeTanachTranslationMode(mode) {
	const resolved = resolvedMode(mode);
	try {
		localStorage.setItem(STORAGE_KEY, resolved);
	} catch {
		// The URL still preserves the learner's explicit choice when storage is unavailable.
	}
	syncQuery(resolved);
	return resolved;
}

export { QUERY_KEY, resolvedMode, syncQuery };
