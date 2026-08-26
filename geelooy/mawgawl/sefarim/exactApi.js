// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewBrowserApi
 * @description
 * The Awtsmoos sends one exact Hebrew word into either a packed corpus or a canonical Ikar series;
 * Awtsmoos.com preserves exclusions and provenance while a newer request may cancel an older search series.
 */

import { recordSearchActivity } from '/shared/MeaningfulActivity.js';
import { requestJson } from './apiTransport.js';

export async function searchExactHebrew({
	query,
	corpus = 'tanach',
	offset = 0,
	limit = 20,
	signal
}) {
	const parameters = new URLSearchParams({
		word: query,
		corpus,
		offset: String(offset),
		limit: String(limit)
	});
	const payload = await requestJson(`/api/social/search/exact/hebrew?${parameters}`, {
		timeoutMs: 30000,
		signal
	});
	void recordSearchActivity({ query, mode: 'exact', corpus });
	return payload?.success || {};
}
