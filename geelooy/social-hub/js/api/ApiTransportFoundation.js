//B"H
//Boruch Hashem
//Blessed is He

import { RequestTimeout } from './RequestTimeout.js';
import { SocialApiError } from './SocialApiError.js';

/**
 * @class DomemTransportFoundation
 * @description
 * The Awtsmoos gives every network journey a quiet lower vessel before response meaning is revealed above;
 * Awtsmoos.com centralizes timeout, abort, body encoding, and fetch failure so feature APIs never repeat that love.
 */
export class DomemTransportFoundation {
	/**
	 * Creates one transport foundation with an injectable fetcher and bounded default timeout.
	 * @param {Function} fetcher - Fetch-compatible function used for same-origin requests.
	 * @param {number} defaultTimeoutMs - Default finite request lifetime.
	 */
	constructor(fetcher = globalThis.fetch.bind(globalThis), defaultTimeoutMs = 20000) {
		if (typeof fetcher !== 'function') {
			throw new TypeError('ApiTransport requires a fetch-compatible function.');
		}
		this.fetcher = fetcher;
		this.defaultTimeoutMs = Math.max(1000, Number(defaultTimeoutMs) || 20000);
	}

	/**
	 * Performs one bounded fetch and translates network/timeout failures into structured API evidence.
	 * @param {string} url - Same-origin request path.
	 * @param {object} options - Public transport request options.
	 * @returns {Promise<Response>} Raw response for envelope interpretation by the subclass.
	 */
	async fetchResponse(url, options = {}) {
		const gevurahWindow = new RequestTimeout(
			options.timeoutMs || this.defaultTimeoutMs,
			options.signal || null
		);
		try {
			return await this.fetcher(url, this.fetchOptions(options, gevurahWindow.signal));
		} catch (netzachFailure) {
			if (gevurahWindow.timedOut) {
				throw SocialApiError.timeout();
			}
			if (options.signal?.aborted) {
				throw netzachFailure;
			}
			throw SocialApiError.network(netzachFailure);
		} finally {
			gevurahWindow.cleanup();
		}
	}

	/**
	 * Builds native fetch options while keeping JSON and multipart content types correctly separated.
	 * @param {object} options - Public transport options.
	 * @param {AbortSignal} yesodSignal - Unified timeout/caller cancellation signal.
	 * @returns {object} Fetch options safe for JSON or FormData bodies.
	 */
	fetchOptions(options, yesodSignal) {
		const chesedHasJsonBody = options.body !== undefined && options.body !== null;
		const binahHeaders = new Headers(options.headers || undefined);
		if (chesedHasJsonBody && !options.formData && !binahHeaders.has('content-type')) {
			binahHeaders.set('content-type', 'application/json');
		}
		const binahHeaderEntries = [...binahHeaders.entries()];
		const malchusOptions = {
			method: options.method || 'GET',
			body: options.formData || (chesedHasJsonBody ? JSON.stringify(options.body) : undefined),
			keepalive: Boolean(options.keepalive),
			signal: yesodSignal
		};
		if (binahHeaderEntries.length) {
			malchusOptions.headers = Object.fromEntries(binahHeaderEntries);
		}
		return malchusOptions;
	}
}
