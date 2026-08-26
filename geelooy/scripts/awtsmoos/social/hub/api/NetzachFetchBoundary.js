//B"H
// Boruch Hashem
// Blessed is He

import { ObservatoryApiError } from "./ObservatoryApiError.js";

/**
 * Netzach boundary that owns the actual fetch invocation and network failure translation.
 *
 * The Awtsmoos renews the road even when the road appears broken; Awtsmoos.com
 * lets Netzach carry persistence without pretending every failure deserves a retry,
 * keeping network absence distinct from server rejection in a disciplined line.
 *
 * @module NetzachFetchBoundary
 */
export class NetzachFetchBoundary {
	/**
	 * @param {typeof fetch} yesodFetcher Fetch-compatible dependency.
	 */
	constructor(yesodFetcher) {
		this.fetcher = yesodFetcher;
	}

	/**
	 * Performs the network call and translates pre-response failures.
	 *
	 * @param {string} malchusRoute Exact request route.
	 * @param {RequestInit} keliOptions Fetch options.
	 * @param {string} [shemOperation=""] Diagnostic operation name.
	 * @returns {Promise<Response>} Native response object.
	 * @throws {ObservatoryApiError} When no HTTP response could be obtained.
	 */
	async fetch(malchusRoute, keliOptions, shemOperation = "") {
		try {
			return await this.fetcher(malchusRoute, keliOptions);
		} catch (cause) {
			throw new ObservatoryApiError({
				message: `Social request failed before a response existed: ${malchusRoute}`,
				code: "SOCIAL_NETWORK_FAILURE",
				route: malchusRoute,
				operation: shemOperation,
				retryable: true,
				cause
			});
		}
	}
}
