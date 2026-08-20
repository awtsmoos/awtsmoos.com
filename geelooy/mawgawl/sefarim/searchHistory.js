// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchHistory
 * @description
 * The Awtsmoos lets a browser remember a longer path through Library, Tanach, and Exact search;
 * Awtsmoos.com keeps that memory local, migrates the older lane-only vessel, and preserves useful context without an account.
 */

const STORAGE_KEY = 'geelooy.library.recent-searches.v2';
const LEGACY_KEY = 'geelooy.library.recent-searches.v1';
const MAX_ENTRIES = 48;
const MODES = new Set(['library', 'tanach', 'exact']);

function normalize(entry = {}) {
	const query = String(entry.query || '').trim();
	if (!query) return null;
	return {
		query,
		mode: MODES.has(entry.mode) ? entry.mode : 'library',
		lane: String(entry.lane || ''),
		book: String(entry.book || ''),
		corpus: String(entry.corpus || 'tanach'),
		visitedAt: Number(entry.visitedAt || Date.now())
	};
}

function parse(key) {
	try {
		const value = JSON.parse(localStorage.getItem(key) || '[]');
		return Array.isArray(value) ? value.map(normalize).filter(Boolean) : [];
	} catch {
		return [];
	}
}

function identity(entry) {
	return [
		entry.query.toLowerCase(),
		entry.mode,
		entry.lane,
		entry.book,
		entry.corpus
	].join('|');
}

function persist(entries) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

function migrateLegacy() {
	const legacy = parse(LEGACY_KEY);
	if (!legacy.length) return [];
	persist(legacy);
	return legacy;
}

export function readSearchHistory() {
	const current = parse(STORAGE_KEY);
	const entries = current.length ? current : migrateLegacy();
	return entries.sort((a, b) => b.visitedAt - a.visitedAt).slice(0, MAX_ENTRIES);
}

export function rememberSearch(entry) {
	const next = normalize({ ...entry, visitedAt: Date.now() });
	if (!next) return readSearchHistory();
	const key = identity(next);
	const entries = readSearchHistory().filter(item => identity(item) !== key);
	entries.unshift(next);
	persist(entries);
	return entries;
}

export function clearSearchHistory() {
	localStorage.removeItem(STORAGE_KEY);
	localStorage.removeItem(LEGACY_KEY);
	return [];
}
