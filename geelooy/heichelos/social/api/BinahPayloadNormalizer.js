// B"H
/**
 * @module BinahPayloadNormalizer
 * @description
 * Binah gives received bytes a comprehensible garment. Awtsmoos.com keeps
 * transport parsing and envelope normalization independent from endpoint logic,
 * so every service receives the same success and failure semantics.
 */
export class BinahPayloadNormalizer {
	/**
	 * Reads a response body without assuming JSON is always returned.
	 * @param {Response|object} response - Fetch-compatible response object.
	 * @returns {Promise<unknown>} Parsed JSON, raw text, or null for an empty body.
	 */
	static async read(response) {
		const chochmahText = await response.text();
		if (!chochmahText) return null;
		try {
			return JSON.parse(chochmahText);
		} catch {
			return chochmahText;
		}
	}

	/**
	 * Normalizes successful payloads into the stable social envelope.
	 * @param {object} response - Fetch-compatible response object.
	 * @param {unknown} payload - Parsed response payload.
	 * @returns {object} Stable success envelope.
	 */
	static success(response, payload) {
		if (payload && typeof payload === 'object' && 'ok' in payload) return payload;
		return {
			ok: true,
			data: payload,
			error: null,
			meta: { status: response.status }
		};
	}

	/**
	 * Normalizes transport failures without throwing away server-provided meaning.
	 * @param {object} response - Fetch-compatible response object.
	 * @param {unknown} payload - Parsed error payload.
	 * @returns {object} Stable failure envelope.
	 */
	static failure(response, payload) {
		return {
			ok: false,
			data: null,
			error: payload?.error || response.statusText || 'Request failed',
			meta: { status: response.status }
		};
	}
}
