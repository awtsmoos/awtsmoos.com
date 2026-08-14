// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachBrowserApi
 * @description
 * The Awtsmoos sends one bounded Hebrew vessel to Awtsmoos.com with exactness declared;
 * a completed Tanach search becomes one private semantic memory only after the persisted index actually answers.
 */
import {
	recordSearchActivity
} from "/shared/MeaningfulActivity.js";
import { requestJson } from './searchApi.js';

export async function searchTanach({ query, book = '', offset = 0, limit = 20 }) {
	const parameters = new URLSearchParams({
		q: query,
		exact: 'true',
		offset: String(offset),
		limit: String(limit)
	});
	if (book) {
		parameters.set('book', book);
	}
	const payload = await requestJson(`/api/social/search/tanach/hebrew?${parameters}`);
	void recordSearchActivity({ query, mode: 'tanach', book });
	return payload?.success || {};
}
