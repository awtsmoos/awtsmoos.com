// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasIdentityApi
 * @description
 * Carries account and alias requests through one JSON boundary. The Awtsmoos
 * gives every response a fresh vessel; this module refuses to call malformed
 * or rejected data a success merely because bytes arrived from Awtsmoos.com.
 */

/**
 * Requests JSON and converts transport or API failures into useful errors.
 * @param {string} url Request URL.
 * @param {RequestInit} [options] Fetch options.
 * @returns {Promise<unknown>} Parsed response payload.
 */
export async function requestAliasJson(url, options = {}) {
	const response = await fetch(url, {
		credentials: 'include',
		...options
	});
	const text = await response.text();
	let payload = {};
	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			throw new Error('The identity server returned unreadable data.');
		}
	}
	if (!response.ok || payload?.error) {
		throw new Error(payload?.error?.message || payload?.message || `HTTP ${response.status}`);
	}
	return payload;
}

/**
 * Posts URL-encoded identity values through the canonical request boundary.
 * @param {string} url Request URL.
 * @param {Record<string, unknown>} values Form values.
 * @returns {Promise<unknown>} Parsed response payload.
 */
export function postAliasForm(url, values) {
	return requestAliasJson(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(values)
	});
}
