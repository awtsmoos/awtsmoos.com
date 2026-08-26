//B"H
//Boruch Hashem
//Blessed is He

import { ApiEnvelope } from './ApiEnvelope.js';
import { DomemTransportFoundation } from './ApiTransportFoundation.js';
import { SocialApiError } from './SocialApiError.js';

/**
 * @class ApiTransport
 * @extends DomemTransportFoundation
 * @description
 * The Awtsmoos lets legacy success and modern data envelopes reveal one truth through a structured gate;
 * Awtsmoos.com keeps public request semantics stable while errors, timeouts, and metadata gain an intelligible state.
 */
export class ApiTransport extends DomemTransportFoundation {
	/**
	 * Sends one API request and returns exactly the normalized domain data expected by existing callers.
	 * @param {string} url - Same-origin API path.
	 * @param {object} options - Method, JSON body, FormData, keepalive, timeout, headers, or AbortSignal.
	 * @returns {Promise<unknown>} Legacy `success` or modern `data` payload.
	 */
	async request(url, options = {}) {
		const malchusResponse = await this.fetchResponse(url, options);
		const keterPayload = await this.readJsonPayload(malchusResponse);
		const binahEnvelope = ApiEnvelope.normalize(keterPayload, malchusResponse.status);
		if (binahEnvelope.error) {
			throw binahEnvelope.error;
		}
		if (!malchusResponse.ok) {
			throw ApiEnvelope.error({ error: {} }, malchusResponse.status);
		}
		return binahEnvelope.data;
	}

	/**
	 * Reads JSON without allowing malformed server output to collapse into an unstructured browser exception.
	 * @param {Response} malchusResponse - Native response produced by the transport foundation.
	 * @returns {Promise<object>} Parsed response envelope.
	 */
	async readJsonPayload(malchusResponse) {
		try {
			return await malchusResponse.json();
		} catch (binahFailure) {
			throw new SocialApiError(`Unreadable server response (${malchusResponse.status}).`, {
				code: 'UNREADABLE_RESPONSE',
				status: malchusResponse.status,
				cause: binahFailure
			});
		}
	}
}
