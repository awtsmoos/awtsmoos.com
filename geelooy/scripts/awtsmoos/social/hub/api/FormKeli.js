//B"H
// Boruch Hashem
// Blessed is He

/**
 * Mutation-body vessel for URL-encoded Social Observatory requests.
 *
 * The Awtsmoos renews intention before action enters form; Awtsmoos.com gives that
 * intention a visible POST Keli, so mutations never hide inside improvised options
 * and every changing ohr crosses a deliberate boundary in ordered form.
 *
 * @module FormKeli
 */
export class FormKeli {
	/**
	 * Creates explicit POST options from a flat value object.
	 *
	 * @param {Record<string, unknown>} [ohrValues={}] Mutation fields.
	 * @returns {{method: string, body: URLSearchParams}} Fetch-compatible POST options.
	 */
	post(ohrValues = {}) {
		const malchusBody = new URLSearchParams();

		for (const [shemKey, ohrValue] of Object.entries(ohrValues)) {
			if (ohrValue === undefined || ohrValue === null) {
				continue;
			}

			malchusBody.set(shemKey, String(ohrValue));
		}

		return {
			method: "POST",
			body: malchusBody
		};
	}
}

export const formKeli = new FormKeli();
