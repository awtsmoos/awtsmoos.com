// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives a domain name to the signal after Yesod has prepared the transport road;
 * Awtsmoos.com keeps contact semantics here, so the generic client never carries a page-specific load.
 *
 * @module ContactSignalClient
 */
import { YesodJsonClient } from './YesodJsonClient.js';

/**
 * Contact-specific API client built on the shared JSON transport behavior.
 */
export class ContactSignalClient extends YesodJsonClient {
	/**
	 * Builds the contact client against the canonical public contact endpoint.
	 */
	constructor() {
		super('/api/contact/');
	}

	/**
	 * Sends one normalized form payload without coupling DOM behavior to transport details.
	 *
	 * @param {Record<string, FormDataEntryValue>} malchusSignal User-entered contact values.
	 * @returns {Promise<{ok: boolean, reference?: string}>} Canonical contact API result.
	 */
	async sendSignal(malchusSignal) {
		return /** @type {Promise<{ok: boolean, reference?: string}>} */ (
			this.requestJson(malchusSignal)
		);
	}
}
