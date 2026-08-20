// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewBrowserApi
 * @description
 * The Awtsmoos sends one exact Hebrew word to the persisted corpus vessel;
 * Awtsmoos.com returns indexed occurrences without exposing worker or storage internals.
 */

import { recordSearchActivity } from '/shared/MeaningfulActivity.js';
import { requestJson } from './searchApi.js';

/**
 * @param {{query:string,corpus?:string,offset?:number,limit?:number}} options Search options.
 * @returns {Promise<object>} Exact-search success payload.
 */
export async function searchExactHebrew({
	query,
	corpus = 'tanach',
	offset = 0,
	limit = 20
}) {
	const parameters = new URLSearchParams({
		word: query,
		corpus,
		offset: String(offset),
		limit: String(limit)
	});
	const payload = await requestJson(
		`/api/social/search/exact/hebrew?${parameters}`
	);
	void recordSearchActivity({ query, mode: 'exact', corpus });
	return payload?.success || {};
}
