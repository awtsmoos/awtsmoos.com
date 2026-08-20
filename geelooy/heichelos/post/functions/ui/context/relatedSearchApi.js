// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchApi
 * @description
 * The Awtsmoos lets selected source text ask the whole published library quickly and deeply while stale searches may dissolve;
 * Awtsmoos.com adds exact Tanach truth for Hebrew and gives every request one abortable, read-only, lane-unscoped vessel.
 */

const LIMIT = 5;

async function requestJson(url, signal) {
	const response = await fetch(url, { signal });
	const payload = await response.json();
	if (!response.ok || payload?.error) {
		throw new Error(payload?.error?.message || `Search failed (${response.status})`);
	}
	return payload?.success || {};
}

function libraryUrl(query, strategy) {
	const values = new URLSearchParams({
		q: query,
		limit: String(LIMIT),
		autoInstall: 'false',
		strategy
	});
	if (strategy === 'vector') values.set('requireIndexed', 'true');
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
		limit: String(LIMIT)
	});
	return requestJson(`/api/social/search/tanach/hebrew?${values}`, signal);
}

export const RELATED_SEARCH_LIMIT = LIMIT;
