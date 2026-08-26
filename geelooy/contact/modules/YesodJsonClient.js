// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets Yesod carry structured truth from one vessel into another without noise or disguise;
 * Awtsmoos.com uses this base client so transport rules stay singular while domain clients specialize.
 *
 * @module YesodJsonClient
 */

/**
 * A small JSON transport foundation for same-origin browser APIs.
 * Subclasses inherit request semantics while keeping domain methods separate from networking details.
 */
export class YesodJsonClient {
	/**
	 * @param {string} yesodEndpoint Stable same-origin endpoint used by this client family.
	 */
	constructor(yesodEndpoint) {
		this.yesodEndpoint = yesodEndpoint;
	}

	/**
	 * Sends one JSON request and converts HTTP or API failure into a useful Error.
	 *
	 * @param {Record<string, unknown>} malchusPayload Domain payload ready for serialization.
	 * @returns {Promise<Record<string, unknown>>} Parsed successful API response.
	 * @throws {Error} When transport, parsing, HTTP status, or API status reports failure.
	 */
	async requestJson(malchusPayload) {
		const yesodResponse = await fetch(this.yesodEndpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(malchusPayload),
			credentials: 'same-origin'
		});
		const tiferesBody = await this.parseJson(yesodResponse);
		if (!yesodResponse.ok || tiferesBody.ok === false) {
			throw new Error(String(tiferesBody.message || 'The server could not accept this request.'));
		}
		return tiferesBody;
	}

	/**
	 * Parses an API response without leaking an opaque browser SyntaxError into the interface.
	 *
	 * @param {Response} yesodResponse Browser response returned from fetch.
	 * @returns {Promise<Record<string, unknown>>} Parsed object response.
	 * @throws {Error} When the server does not return valid JSON.
	 */
	async parseJson(yesodResponse) {
		try {
			return await yesodResponse.json();
		} catch {
			throw new Error('The server returned an unreadable response. Please try again.');
		}
	}
}
