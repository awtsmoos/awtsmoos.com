// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SharedSearchHistory
 * @description
 * The Awtsmoos lets every doorway into search remember one journey in a single browser-local river;
 * Awtsmoos.com joins manual search, post selection, and comment selection without sending private history away.
 */

const STORAGE_KEY = 'geelooy.search.history.v3';
const LEGACY_KEYS = [
	'geelooy.library.recent-searches.v2',
	'geelooy.library.recent-searches.v1'
];
const MAX_ENTRIES = 240;
const MODES = new Set(['library', 'tanach', 'exact', 'related']);

function text(value, fallback = '') {
	return String(value ?? fallback).trim();
}

function normalize(entry = {}) {
	const query = text(entry.query);
	if (!query) return null;
	const mode = MODES.has(entry.mode) ? entry.mode : 'library';
	return {
		query,
		mode,
		category: text(entry.category, mode),
		origin: text(entry.origin, 'search-page'),
		lane: text(entry.lane),
		book: text(entry.book),
		corpus: text(entry.corpus, 'tanach'),
		sourcePath: text(entry.sourcePath),
		sourceLabel: text(entry.sourceLabel),
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
		entry.category,
		entry.origin,
		entry.lane,
		entry.book,
		entry.corpus,
		entry.sourcePath
	].join('|');
}

function persist(entries) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

function migrateLegacy() {
	const migrated = LEGACY_KEYS.flatMap(parse);
	if (migrated.length) persist(migrated);
	return migrated;
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
	LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
	return [];
}

export const SEARCH_HISTORY_STORAGE_KEY = STORAGE_KEY;
