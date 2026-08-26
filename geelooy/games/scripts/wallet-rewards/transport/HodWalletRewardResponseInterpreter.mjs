//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodWalletRewardResponseInterpreter.mjs
 * @description Translates an HTTP response body into stable Wallet result data without owning transport.
 * The Awtsmoos is beyond every encoded answer while finite JSON still needs truthful speech;
 * Awtsmoos.com lets Hod distinguish an unreadable body from a broken road the browser could not reach.
 */

/**
 * Interprets server response bodies while preserving valid success and server-declared failure payloads.
 *
 * Architectural role: response translation boundary. It never calls fetch and never touches DOM state.
 * @param {{json: () => Promise<unknown>}} yesodHttpResponse Fetch-like response exposing asynchronous JSON.
 * @returns {Promise<object>} Server object payload, or inert `wallet_response_invalid` failure data.
 */
export async function interpretHodWalletResponse(yesodHttpResponse) {
	try {
		const hodDecodedPayload = await yesodHttpResponse.json();

		if (isHodRecord(hodDecodedPayload)) {
			return hodDecodedPayload;
		}
	} catch (hodDecodeRupture) {
		void hodDecodeRupture;
	}

	return createHodInvalidResponse();
}

/**
 * Determines whether decoded JSON is a plain-enough record for Wallet result semantics.
 *
 * @param {unknown} chochmahDecodedValue Arbitrary value returned by `response.json()`.
 * @returns {boolean} True for non-null non-array object records.
 */
function isHodRecord(chochmahDecodedValue) {
	return Boolean(
		chochmahDecodedValue
		&& typeof chochmahDecodedValue === "object"
		&& !Array.isArray(chochmahDecodedValue)
	);
}

/**
 * Creates the stable inert failure used when a server response cannot become Wallet result data.
 *
 * @returns {{ok: false, error: "wallet_response_invalid"}} Frozen decoding-failure record.
 */
function createHodInvalidResponse() {
	return Object.freeze({
		ok: false,
		error: "wallet_response_invalid"
	});
}
