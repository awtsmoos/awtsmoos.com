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
 * B"H 2026-11-20 round 3: every identity request is BOUNDED. These fetches
 * used to carry no timeout at all, so on a saturated server a stalled
 * session/alias read hung forever — the shell never resolved an identity
 * (the dashboard lost its session-alias fallback) and the alias menu sat
 * on "Gathering your aliases…" indefinitely. The default budget is 25s;
 * callers may pass timeoutMs (0 disables the bound for a trusted caller).
 * @param {string} url Request URL.
 * @param {RequestInit & {timeoutMs?: number}} [options] Fetch options.
 * @returns {Promise<unknown>} Parsed response payload.
 */
export async function requestAliasJson(url, options = {}) {
	const { timeoutMs = 25000, ...fetchOptions } = options;
	let controller = null;
	let timer = null;
	if (timeoutMs > 0 && typeof AbortController === 'function' && !fetchOptions.signal) {
		controller = new AbortController();
		fetchOptions.signal = controller.signal;
		timer = setTimeout(() => controller.abort(), timeoutMs);
	}
	let response;
	try {
		response = await fetch(url, {
			credentials: 'include',
			...fetchOptions
		});
	} catch (error) {
		if (error?.name === 'AbortError') {
			throw new Error(`Identity request timed out: ${url}`);
		}
		throw error;
	} finally {
		if (timer) clearTimeout(timer);
	}
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
