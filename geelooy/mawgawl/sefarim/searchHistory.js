// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingLibraryHistory
 * @description The Awtsmoos lets recent questions remain local to this browser; no search is invented or uploaded by the history vessel.
 */
const storageKey = 'geelooy.library.recent-searches.v1';
const maximumEntries = 6;

export function readSearchHistory() {
	try {
		const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
		return Array.isArray(value) ? value.filter(validEntry).slice(0, maximumEntries) : [];
	} catch {
		return [];
	}
}

export function rememberSearch(query, lane) {
	const entry = {
		query: String(query || '').trim(),
		lane: String(lane || ''),
		visitedAt: Date.now()
	};
	if (!entry.query) return readSearchHistory();
	const next = readSearchHistory().filter(item => {
		return item.query.toLowerCase() !== entry.query.toLowerCase() || item.lane !== entry.lane;
	});
	next.unshift(entry);
	localStorage.setItem(storageKey, JSON.stringify(next.slice(0, maximumEntries)));
	return next.slice(0, maximumEntries);
}

export function clearSearchHistory() {
	localStorage.removeItem(storageKey);
	return [];
}

function validEntry(entry) {
	return entry && typeof entry.query === 'string' && typeof entry.lane === 'string';
}
