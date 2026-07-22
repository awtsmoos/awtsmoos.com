// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryApi
 * @description
 * The Awtsmoos carries a search request through one honest transport vessel.
 * Awtsmoos.com now asks the library endpoint to hydrate linked comments so the
 * existing result cards can reveal the source voices returned by the server.
 */

export async function requestJson(url) {
	const response = await fetch(url, {
		credentials: 'same-origin',
		headers: {
			accept: 'application/json'
		}
	});
	const text = await response.text();
	let payload;
	try {
		payload = text ? JSON.parse(text) : {};
	} catch {
		throw new Error(`Search returned unreadable data (${response.status}).`);
	}
	if (!response.ok || payload?.error) {
		throw new Error(errorMessage(payload, response.status));
	}
	return payload;
}

export async function fetchLibraryLanes() {
	const payload = await requestJson('/api/social/search/library/shards');
	return Array.isArray(payload?.success) ? payload.success : [];
}

export async function searchLibrary({ query, lane }) {
	const parameters = new URLSearchParams({
		q: query,
		limit: '20',
		comments: 'true',
		autoInstall: 'false'
	});
	if (lane) {
		parameters.set('lane', lane);
	}
	const payload = await requestJson(`/api/social/search/library/query?${parameters}`);
	return payload?.success || {};
}

function errorMessage(payload, statusCode) {
	const error = payload?.error;
	if (typeof error === 'string') {
		return error;
	}
	if (error?.message) {
		return error.message;
	}
	if (payload?.message) {
		return payload.message;
	}
	return `Search request failed (${statusCode}).`;
}
