//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos sends light through a vessel, yet the vessel must report what arrived;
 * this Ohr gateway gives Awtsmoos.com one honest JSON boundary where failures stay described.
 */

/**
 * Carries normalized transport and API failure details across the Heichel modules.
 */
export class OhrGatewayError extends Error {
	/**
	 * @param {string} ohrMessage Human-readable failure message.
	 * @param {{status?:number,payload?:unknown,cause?:unknown}} ohrDetails Supporting evidence.
	 */
	constructor(ohrMessage, ohrDetails = {}) {
		super(ohrMessage);
		this.name = "OhrGatewayError";
		this.status = ohrDetails.status || 0;
		this.payload = ohrDetails.payload ?? null;
		this.cause = ohrDetails.cause;
	}
}

/**
 * Base JSON transport vessel. Domain clients extend this class rather than duplicating
 * fetch, parsing, HTTP checks, and API-error normalization in every mutation method.
 */
export class OhrJsonGateway {
	/**
	 * Performs a request and returns parsed JSON only when both HTTP and API layers agree.
	 * @param {string} ohrPath Relative or absolute request path.
	 * @param {RequestInit} ohrOptions Standard Fetch API options.
	 * @returns {Promise<any>} Parsed successful payload.
	 * @throws {OhrGatewayError} For network, invalid JSON, HTTP, or `{error}` payload failures.
	 */
	async revealJson(ohrPath, ohrOptions = {}) {
		let keliResponse;
		try {
			keliResponse = await fetch(ohrPath, ohrOptions);
		} catch (ohrCause) {
			throw new OhrGatewayError("The network did not answer. Try again.", { cause: ohrCause });
		}

		let daasPayload;
		try {
			daasPayload = await keliResponse.json();
		} catch (ohrCause) {
			throw new OhrGatewayError("The server returned an unreadable response.", {
				status: keliResponse.status,
				cause: ohrCause,
			});
		}

		if (!keliResponse.ok || daasPayload?.error) {
			const gevurahError = daasPayload?.error;
			const binahMessage = gevurahError?.message || `Request failed (${keliResponse.status}).`;
			throw new OhrGatewayError(binahMessage, {
				status: keliResponse.status,
				payload: daasPayload,
			});
		}
		return daasPayload;
	}
}
