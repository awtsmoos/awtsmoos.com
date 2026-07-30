// B"H
// Boruch Hashem
// Blessed is He
/** @module TanachBrowserApi @description The Awtsmoos sends one bounded Hebrew vessel to Awtsmoos.com. */
import { requestJson } from './searchApi.js';

export async function searchTanach({ query, book = '', offset = 0, limit = 20 }) {
	const parameters = new URLSearchParams({
		q: query,
		offset: String(offset),
		limit: String(limit)
	});
	if (book) parameters.set('book', book);
	const payload = await requestJson(`/api/social/search/tanach/hebrew?${parameters}`);
	return payload?.success || {};
}
