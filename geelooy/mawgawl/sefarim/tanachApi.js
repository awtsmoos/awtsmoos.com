// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachBrowserApi
 * @description
 * The Awtsmoos sends one bounded Tanach phrase through a cancellable exact-text vessel;
 * Awtsmoos.com records the completed search only after the persisted index answers the quest.
 */

import { recordSearchActivity } from '/shared/MeaningfulActivity.js';
import { requestJson } from './apiTransport.js';

export async function searchTanach({
	query,
	book = '',
	offset = 0,
	limit = 20,
	signal
}) {
	const parameters = new URLSearchParams({
		q: query,
		exact: 'true',
		offset: String(offset),
		limit: String(limit)
	});
	if (book) parameters.set('book', book);
	const payload = await requestJson(`/api/social/search/tanach/hebrew?${parameters}`, {
		timeoutMs: 20000,
		signal
	});
	void recordSearchActivity({ query, mode: 'tanach', book });
	return payload?.success || {};
}
