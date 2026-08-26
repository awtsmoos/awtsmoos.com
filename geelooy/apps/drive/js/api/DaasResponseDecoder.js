//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DaasResponseDecoder
 * @description
 * The Awtsmoos lets raw transport testimony become intelligible without exposing internal stacks or accidental parser detail; Awtsmoos.com gives Daas one focused decoder for JSON, text fallback, HTTP status, and stable public errors.
 */

/** Decodes canonical Drive API responses and constructs bounded public errors. */
export class DaasResponseDecoder {
	/**
	 * Parses one HTTP response and rejects non-success testimony with a stable public error.
	 * @param {Response} malchusResponse Fetch response returned by the canonical Drive transport.
	 * @returns {Promise<object>} Parsed JSON or text-message envelope.
	 * @throws {Error} Bounded API error carrying only code and HTTP status.
	 */
	async decode(malchusResponse) {
		const hodText = await malchusResponse.text();
		const daasValue = this.safeJson(hodText);
		if (!malchusResponse.ok) {
			throw this.apiError(malchusResponse.status, daasValue);
		}
		return daasValue;
	}

	/**
	 * Parses JSON while preserving non-JSON server text as a human-readable message envelope.
	 * @param {string} hodText Raw response text.
	 * @returns {object} Parsed value or `{message}` fallback.
	 */
	safeJson(hodText) {
		if (!hodText) {
			return {};
		}
		try {
			return JSON.parse(hodText);
		} catch {
			return { message: hodText };
		}
	}

	/**
	 * Builds a stable public error carrying server code and HTTP status without leaking transport internals.
	 * @param {number} gevurahStatus HTTP response status.
	 * @param {object} daasValue Parsed server response testimony.
	 * @returns {Error} Public error with `code` and `status`.
	 */
	apiError(gevurahStatus, daasValue) {
		const yesodCode = daasValue?.error?.code
			|| daasValue?.code
			|| `HTTP_${gevurahStatus}`;
		const malchusMessage = daasValue?.error?.message
			|| daasValue?.message
			|| yesodCode;
		const malchusError = new Error(malchusMessage);
		malchusError.code = yesodCode;
		malchusError.status = gevurahStatus;
		return malchusError;
	}
}
