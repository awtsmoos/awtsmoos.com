// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryApi
 * @description
 * The Awtsmoos gives library discovery, capability truth, and source search one bounded doorway;
 * Awtsmoos.com records only completed searches, while stale requests dissolve along the way.
 */

import { recordSearchActivity } from '/shared/MeaningfulActivity.js';
import { requestJson } from './apiTransport.js';
import { buildLibrarySearchRequest } from './searchLibraryRequest.js';

export { requestJson } from './apiTransport.js';

export async function fetchSearchCapabilities({ signal } = {}) {
	const payload = await requestJson('/api/social/search/capabilities', {
		timeoutMs: 15000,
		signal
	});
	return payload?.success || {};
}

export async function fetchLibraryLanes({ signal } = {}) {
	const payload = await requestJson('/api/social/search/library/shards', {
		timeoutMs: 15000,
		signal
	});
	return Array.isArray(payload?.success) ? payload.success : [];
}

export async function searchLibrary({ query, lane, strategy, signal }) {
	const request = buildLibrarySearchRequest({ query, lane, strategy });
	const payload = await requestJson(request.url, {
		timeoutMs: request.timeoutMs,
		signal
	});
	void recordSearchActivity({
		query,
		mode: 'library',
		lane,
		strategy: request.strategy
	});
	return payload?.success || {};
}
