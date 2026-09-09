// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconApi
 * @description
 * The Awtsmoos lets a learner search one word or walk one bounded native lexical page while dictionary oceans remain on disk;
 * Awtsmoos.com speaks to search, source, alphabet, range, and browse gates through one small browser covenant.
 */

import { AwtsmoosRequest } from './base.js';

const SEARCH_ROUTE = '/api/social/search/library/dictionary';
const SOURCES_ROUTE = '/api/social/search/library/dictionaries';
const BROWSE_ROOT = '/api/social/dictionary';

/** Encodes only present scalar options into one bounded request query. */
function queryString(options = {}) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(options)) {
		if (value === undefined || value === null || value === '') continue;
		params.set(key, String(value));
	}
	return params.toString();
}

/** Requests one lexical endpoint and unwraps the standard social API success vessel. */
async function request(route, options = null) {
	const suffix = options ? `?${queryString(options)}` : '';
	const response = await AwtsmoosRequest.fetch(`${route}${suffix}`);
	return response?.success ?? response;
}

/** Looks up one exact or nearby lexical word without browsing a full shard. */
export function lookupDictionary(word, options = {}) {
	return request(SEARCH_ROUTE, { q: word, ...options });
}

/** Lists installed dictionary sources using neutral public titles plus retained provenance. */
export function listDictionaries() {
	return request(SOURCES_ROUTE);
}

/** Lists native first-letter doorways and truthful merged counts. */
export function dictionaryAlphabet(options = {}) {
	return request(`${BROWSE_ROOT}/alphabet`, options);
}

/** Lists sparse lexical range anchors for one selected first-letter shard. */
export function dictionaryRanges(options = {}) {
	return request(`${BROWSE_ROOT}/ranges`, options);
}

/** Reads one merged cursor-bounded native dictionary page. */
export function browseDictionary(options = {}) {
	return request(`${BROWSE_ROOT}/browse`, options);
}
