// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingLibraryApi
 * @description The Awtsmoos carries bounded search requests through an honest transport with explicit timeout and readable failure states;
 * Awtsmoos.com records only a completed semantic search after the source service actually answers, never keystrokes or request noise.
 */
import {
	recordSearchActivity
} from "/shared/MeaningfulActivity.js";

const REQUEST_TIMEOUT_MS = 20000;

export async function requestJson(url) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	let response;
	try {
		response = await fetch(url, {
			credentials: 'same-origin',
			headers: { accept: 'application/json' },
			signal: controller.signal
		});
	} catch (error) {
		if (error.name === 'AbortError') throw new Error('Search took too long. Please try again.');
		throw new Error('Search could not reach the library service.');
	} finally {
		clearTimeout(timeout);
	}

	const text = await response.text();
	let payload;
	try {
		payload = text ? JSON.parse(text) : {};
	} catch {
		throw new Error(`Search returned unreadable data (${response.status}).`);
	}
	if (!response.ok || payload?.error) throw new Error(errorMessage(payload, response.status));
	return payload;
}

export async function fetchLibraryLanes() {
	const payload = await requestJson('/api/social/search/library/shards');
	return Array.isArray(payload?.success) ? payload.success : [];
}

export async function searchLibrary({ query, lane }) {
	const parameters = new URLSearchParams({ q: query, limit: '20', autoInstall: 'false' });
	if (lane) parameters.set('lane', lane);
	const payload = await requestJson(`/api/social/search/library/query?${parameters}`);
	void recordSearchActivity({ query, mode: 'library', lane });
	return payload?.success || {};
}

function errorMessage(payload, statusCode) {
	const error = payload?.error;
	if (typeof error === 'string') return error;
	if (error?.message) return error.message;
	if (payload?.message) return payload.message;
	return `Search request failed (${statusCode}).`;
}
