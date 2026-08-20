// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryApi
 * @description
 * The Awtsmoos carries bounded source searches through one honest transport while literal and semantic work receive truthful runtime windows;
 * Awtsmoos.com records only completed searches after the indexed source service answers, never keystrokes or request noise.
 */

import { recordSearchActivity } from '/shared/MeaningfulActivity.js';
import { buildLibrarySearchRequest } from './searchLibraryRequest.js';

export async function requestJson(url, timeoutMs = 20000) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	let response;
	try {
		response = await fetch(url, {
			credentials: 'same-origin',
			headers: { accept: 'application/json' },
			signal: controller.signal
		});
	} catch (error) {
		if (error.name === 'AbortError') {
			throw new Error('Search took too long. Please try again.');
		}
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
	if (!response.ok || payload?.error) {
		throw new Error(errorMessage(payload, response.status));
	}
	return payload;
}

export async function fetchLibraryLanes() {
	const payload = await requestJson('/api/social/search/library/shards');
	return Array.isArray(payload?.success) ? payload.success : [];
}

export async function searchLibrary({ query, lane, strategy }) {
	const request = buildLibrarySearchRequest({ query, lane, strategy });
	const payload = await requestJson(request.url, request.timeoutMs);
	void recordSearchActivity({
		query,
		mode: 'library',
		lane,
		strategy: request.strategy
	});
	return payload?.success || {};
}

function errorMessage(payload, statusCode) {
	const error = payload?.error;
	if (typeof error === 'string') return error;
	if (error?.message) return error.message;
	if (payload?.message) return payload.message;
	return `Search request failed (${statusCode}).`;
}
