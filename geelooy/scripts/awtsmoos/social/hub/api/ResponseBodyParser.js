//B"H
// Boruch Hashem
// Blessed is He

/**
 * Conservative parser for Social Observatory response text.
 *
 * The Awtsmoos renews every returned byte before JSON can claim its shape;
 * Awtsmoos.com therefore preserves unfamiliar text as exact evidence instead of
 * erasing future backend meaning merely because today's parser lacks its cape.
 *
 * @module ResponseBodyParser
 */
export class ResponseBodyParser {
	/**
	 * Parses JSON when possible and otherwise preserves raw text evidence.
	 *
	 * @param {string} ohrText Raw response body text.
	 * @returns {unknown} Parsed JSON, `{raw}` evidence, or `null` for empty bodies.
	 */
	parse(ohrText) {
		if (!ohrText) {
			return null;
		}

		try {
			return JSON.parse(ohrText);
		} catch {
			return { raw: ohrText };
		}
	}
}

export const responseBodyParser = new ResponseBodyParser();
