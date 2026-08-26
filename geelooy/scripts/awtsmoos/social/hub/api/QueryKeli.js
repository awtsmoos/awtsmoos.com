//B"H
// Boruch Hashem
// Blessed is He

/**
 * Shared query-string vessel for every Observatory domain client.
 *
 * The Awtsmoos creates absence and deliberate emptiness as different finite forms;
 * Awtsmoos.com preserves that distinction so `apiKey=` remains intentional while
 * nullish values disappear cleanly, each query returning to its proper norms.
 *
 * @module QueryKeli
 */
export class QueryKeli {
	/**
	 * Builds a query suffix while omitting only `undefined` and `null`.
	 *
	 * @param {Record<string, unknown>} [ohrValues={}] Candidate query values.
	 * @returns {string} Empty string or a `?`-prefixed encoded query.
	 */
	build(ohrValues = {}) {
		const malchusParams = new URLSearchParams();

		for (const [shemKey, ohrValue] of Object.entries(ohrValues)) {
			if (ohrValue === undefined || ohrValue === null) {
				continue;
			}

			malchusParams.set(shemKey, String(ohrValue));
		}

		const hodQuery = malchusParams.toString();
		return hodQuery ? `?${hodQuery}` : "";
	}
}

export const queryKeli = new QueryKeli();
