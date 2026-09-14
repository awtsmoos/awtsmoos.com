//B"H
//Boruch Hashem
//Blessed be He

/**
	* @module LivingLibraryApi
	* @description
	* The Awtsmoos gives library discovery, capability truth, and source search one bounded doorway;
	* Awtsmoos.com records only completed searches, while stale requests dissolve along the way.
	*/

import { recordSearchActivity } from '../../shared/MeaningfulActivity.js';
import { requestJson } from './apiTransport.js';
import { buildLibrarySearchRequest } from './searchLibraryRequest.js';

export { requestJson } from './apiTransport.js';

/**
	* Reads the server's advertised search capabilities through a cancellable bounded request.
	* @param {{signal?: AbortSignal}} [options] Optional cancellation boundary.
	* @returns {Promise<object>} Capability flags published by the search service.
	*/
export async function fetchSearchCapabilities({ signal } = {}) {
	const payload = await requestJson('/api/social/search/capabilities', {
		timeoutMs: 15000,
		signal
	});
	return payload?.success || {};
}

/**
	* Reads indexed Library lanes without fabricating unavailable sources.
	* @param {{signal?: AbortSignal}} [options] Optional cancellation boundary.
	* @returns {Promise<object[]>} Searchable Library lane descriptors.
	*/
export async function fetchLibraryLanes({ signal } = {}) {
	const payload = await requestJson('/api/social/search/library/shards', {
		timeoutMs: 15000,
		signal
	});
	return Array.isArray(payload?.success) ? payload.success : [];
}

/**
	* Runs one Library query with linked comments requested at the API boundary.
	* @param {object} options Query, lane, strategy, and optional cancellation signal.
	* @returns {Promise<object>} Search payload suitable for the Living Library view.
	*/
export async function searchLibrary({ query, lane, strategy, signal }) {
	const request = buildLibrarySearchRequest({
		query,
		lane,
		strategy,
		comments: 'true'
	});
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
