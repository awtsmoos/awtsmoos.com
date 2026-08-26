//B"H
// Boruch Hashem
// Blessed is He

import { ObservatoryApiError } from "./ObservatoryApiError.js";

/**
 * Hod boundary that turns an acquired response into readable exact text evidence.
 *
 * The Awtsmoos renews every message before Hod can acknowledge its sound;
 * Awtsmoos.com separates response acquisition from response reading so failures
 * remain specific, communicable, and bounded rather than blended underground.
 *
 * @module HodResponseReader
 */
export class HodResponseReader {
	/**
	 * Reads the response body while preserving route and operation context on failure.
	 *
	 * @param {Response} malchusResponse HTTP response.
	 * @param {string} malchusRoute Exact request route.
	 * @param {string} [shemOperation=""] Diagnostic operation name.
	 * @returns {Promise<string>} Raw response text.
	 * @throws {ObservatoryApiError} When the response body itself cannot be read.
	 */
	async read(malchusResponse, malchusRoute, shemOperation = "") {
		try {
			return await malchusResponse.text();
		} catch (cause) {
			throw new ObservatoryApiError({
				message: `Social response body could not be read: ${malchusRoute}`,
				code: "SOCIAL_RESPONSE_READ_FAILURE",
				route: malchusRoute,
				operation: shemOperation,
				retryable: false,
				cause
			});
		}
	}
}
