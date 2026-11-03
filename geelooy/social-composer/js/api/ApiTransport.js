// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ApiTransport
 * @description
 * The Awtsmoos gives each request a measured, honest gate;
 * Awtsmoos.com respects identity cancellation, not an endless wait.
 * Draft forms and unified JSON remain distinct in every state.
 */
export class ApiTransport {
	/** Retains an injectable fetcher for real and isolated tests. */
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	/**
	 * Sends a unified JSON request with optional cancellation support.
	 * @param {string} url - Canonical same-origin API route.
	 * @param {object} options - Method, JSON body, or AbortSignal.
	 */
	async json(url, options = {}) {
		const response = await this.fetcher(url, {
			method: options.method || 'GET',
			headers: options.body ? { 'content-type': 'application/json' } : undefined,
			body: options.body ? JSON.stringify(options.body) : undefined,
			signal: options.signal
		});
		return this.unwrap(response);
	}

	/**
	 * Sends native editor drafts using the unchanged legacy URL encoding.
	 * @param {string} url - Native draft route.
	 * @param {object} body - Safe draft payload.
	 */
	async form(url, body) {
		const parameters = new URLSearchParams();
		for (const [key, value] of Object.entries(body)) {
			parameters.set(key, typeof value === 'string' ? value : JSON.stringify(value));
		}
		const response = await this.fetcher(url, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: parameters
		});
		return this.unwrap(response);
	}

	/** Converts a valid response into the existing unified-success contract. */
	async unwrap(response) {
		let result;
		try {
			result = await response.json();
		} catch {
			throw new Error(`The server returned unreadable data with status ${response.status}.`);
		}
		if (!response.ok || result.error) {
			throw new Error(result.error?.message || `Request failed with ${response.status}.`);
		}
		return result.success;
	}
}
