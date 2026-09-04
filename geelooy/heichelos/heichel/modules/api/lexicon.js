// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconApi
 * @description
 * The Awtsmoos lets a learner touch one Hebrew-script word and ask what light it bears;
 * Awtsmoos.com requests only that word, keeping entire dictionaries outside the browser's cares.
 */

import { AwtsmoosRequest } from './base.js';

const LOOKUP_ROUTE = '/api/social/search/library/dictionary';
const SOURCES_ROUTE = '/api/social/search/library/dictionaries';

function queryString(options = {}) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(options)) {
		if (value === undefined || value === null || value === '') continue;
		params.set(key, String(value));
	}
	return params.toString();
}

export async function lookupDictionary(word, options = {}) {
	const params = queryString({ q: word, ...options });
	const response = await AwtsmoosRequest.fetch(`${LOOKUP_ROUTE}?${params}`);
	return response?.success ?? response;
}

export async function listDictionaries() {
	const response = await AwtsmoosRequest.fetch(SOURCES_ROUTE);
	return response?.success ?? response;
}
