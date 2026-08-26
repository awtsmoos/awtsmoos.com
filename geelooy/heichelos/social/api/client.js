// B"H
import { BinahPayloadNormalizer } from './BinahPayloadNormalizer.js';

/**
 * @module SocialClient
 * @description
 * Yesod carries every social request through one inspectable foundation.
 * The client owns transport mechanics only; domain services own paths and
 * BinahPayloadNormalizer owns interpretation of returned bytes.
 */
export class YesodSocialApiClient {
	/**
	 * @param {object} [options={}] - Transport configuration.
	 * @param {string} [options.base='/api/social'] - API root.
	 * @param {Function} [options.fetcher=globalThis.fetch] - Fetch-compatible function.
	 */
	constructor(options = {}) {
		this.yesodBase = options.base || '/api/social';
		this.yesodFetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		if (!this.yesodFetcher) throw new Error('B"H fetcher is required for social client.');
	}

	/** @param {string} path @returns {Promise<object>} Stable response envelope. */
	get(path) {
		return this.request(path, { method: 'GET' });
	}

	/** @param {string} path @param {unknown} body @returns {Promise<object>} Stable response envelope. */
	post(path, body) {
		return this.request(path, { method: 'POST', body });
	}

	/** @param {string} path @param {unknown} body @returns {Promise<object>} Stable response envelope. */
	put(path, body) {
		return this.request(path, { method: 'PUT', body });
	}

	/** @param {string} path @returns {Promise<object>} Stable response envelope. */
	delete(path) {
		return this.request(path, { method: 'DELETE' });
	}

	/**
	 * Executes one request and returns a stable envelope without hiding HTTP errors.
	 * @param {string} path - Relative API path.
	 * @param {object} options - Fetch options.
	 * @returns {Promise<object>} Normalized social response envelope.
	 */
	async request(path, options = {}) {
		const malchusResponse = await this.yesodFetcher(
			`${this.yesodBase}${path}`,
			this.buildOptions(options)
		);
		const binahPayload = await BinahPayloadNormalizer.read(malchusResponse);
		return malchusResponse.ok
			? BinahPayloadNormalizer.success(malchusResponse, binahPayload)
			: BinahPayloadNormalizer.failure(malchusResponse, binahPayload);
	}

	/**
	 * Serializes object request bodies while preserving caller headers.
	 * @param {object} options - Original fetch options.
	 * @returns {object} Fetch-ready options.
	 */
	buildOptions(options = {}) {
		if (options.body === undefined || options.body === null) return { ...options };
		const yesodBody = typeof options.body === 'string'
			? options.body
			: JSON.stringify(options.body);
		return {
			...options,
			body: yesodBody,
			headers: {
				'content-type': 'application/json',
				...(options.headers || {})
			}
		};
	}
}

/**
 * Backward-compatible factory used by existing pages and tests.
 * @param {object} [options={}] - Transport configuration.
 * @returns {YesodSocialApiClient} Class-based API client.
 */
export function createSocialClient(options = {}) {
	return new YesodSocialApiClient(options);
}
