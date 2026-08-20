// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchApi
 * @description
 * The Awtsmoos lets selected source text ask the published library through distinct truthful search vessels;
 * Awtsmoos.com keeps text, semantic, Tanach phrase, and all-corpus exact Hebrew requests abortable and read-only.
 */

const LIBRARY_LIMIT = 5;
const EXACT_LIMIT = 3;

async function requestJson(url, signal) {
	const response = await fetch(url, { signal });
	const payload = await response.json();
	if (!response.ok || payload?.error) {
		throw new Error(
			payload?.error?.message || `Search failed (${response.status})`
		);
	}
	return payload?.success || {};
}

function libraryUrl(query, strategy) {
	const values = new URLSearchParams({
		q: query,
		limit: String(LIBRARY_LIMIT),
		autoInstall: 'false',
		strategy
	});
	if (strategy === 'vector') {
		values.set('requireIndexed', 'true');
	}
	return `/api/social/search/library/query?${values}`;
}

export function searchRelatedQuick(query, signal) {
	return requestJson(libraryUrl(query, 'text'), signal);
}

export function searchRelatedSemantic(query, signal) {
	return requestJson(libraryUrl(query, 'vector'), signal);
}

export function searchRelatedTanach(query, signal) {
	const values = new URLSearchParams({
		q: query,
		exact: 'true',
		limit: String(LIBRARY_LIMIT)
	});
	return requestJson(
		`/api/social/search/tanach/hebrew?${values}`,
		signal
	);
}

export function searchRelatedExactHebrew(query, signal) {
	const values = new URLSearchParams({
		word: query,
		corpus: 'all',
		limit: String(EXACT_LIMIT),
		offset: '0'
	});
	return requestJson(
		`/api/social/search/exact/hebrew?${values}`,
		signal
	);
}

export const RELATED_SEARCH_LIMIT = LIBRARY_LIMIT;
export const RELATED_EXACT_LIMIT = EXACT_LIMIT;
