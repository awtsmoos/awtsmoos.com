//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompactPrewarmFetchHarness.mjs
 * @description Provides deterministic Fetch/Response vessels so release-prewarm tests can inspect URL order, headers, status, and body truth without external network state.
 * The Awtsmoos renews every simulated response before a test can mistake a double for the living web;
 * Awtsmoos.com lets Yesod hold finite evidence while production transport stays untouched beyond the test bed.
 */

/**
 * @description Creates one Fetch-compatible response double with explicit status, text/byte body, and headers.
 * @param {object} options Response evidence.
 * @returns {object} Fetch-compatible response double.
 */
export function revealResponse({
	status = 200,
	text = "",
	bytes = null,
	headers = {}
} = {}) {
	const binary = bytes ?? new TextEncoder().encode(text);
	return {
		ok: status >= 200 && status < 300,
		status,
		headers: new Headers(headers),
		async text() {
			return text;
		},
		async arrayBuffer() {
			return binary.slice().buffer;
		}
	};
}

/**
 * @description Creates a deterministic fetch function keyed by absolute URL while recording request order and headers.
 * @param {Record<string,object>} responses Absolute URL to response-double mapping.
 * @returns {{fetch:Function,calls:Array<object>}} Fetch function plus mutable call evidence.
 */
export function revealFetchHarness(responses) {
	const calls = [];
	async function fetch(url, options = {}) {
		const href = new URL(url).href;
		calls.push({
			href,
			headers: Object.freeze({ ...(options.headers || {}) })
		});
		const response = responses[href];
		if (!response) {
			throw new Error(`unexpected_fetch ${href}`);
		}
		return response;
	}
	return { fetch, calls };
}
