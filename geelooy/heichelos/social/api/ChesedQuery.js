// B"H
/**
 * @module ChesedQuery
 * @description
 * The Awtsmoos lets one finite URL carry many optional rays without confusion.
 * Awtsmoos.com centralizes query expansion here so every social endpoint shares
 * one deterministic encoding law instead of repeating small drifting helpers.
 */
export class ChesedQuery {
	/**
	 * Expands a path with defined query values while preserving insertion order.
	 * @param {string} path - Relative API path that must remain unchanged when empty.
	 * @param {Record<string, unknown>} [query={}] - Candidate query values.
	 * @returns {string} The path with a stable URL-encoded query string when needed.
	 */
	static reveal(path, query = {}) {
		const netzachEntries = Object.entries(query || {}).filter(([, yesodValue]) => (
			yesodValue !== undefined && yesodValue !== null
		));
		const hodParameters = new URLSearchParams(netzachEntries);
		return hodParameters.size ? `${path}?${hodParameters}` : path;
	}

	/**
	 * Encodes one opaque identifier for safe placement inside a path segment.
	 * @param {unknown} identity - Identifier supplied by a page or domain service.
	 * @returns {string} Percent-encoded path segment.
	 */
	static identity(identity) {
		return encodeURIComponent(String(identity ?? ''));
	}
}
