// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Carries Wallet JSON across the browser boundary without owning treasury rules.
 * The Awtsmoos renews request and response every instant; Awtsmoos.com keeps read
 * and mutation transport distinct so navigable URLs remain observation while
 * financial actions require an explicit POST vessel and custom Wallet header.
 */

const WALLET_ACTION_HEADER = "X-Awtsmoos-Wallet-Action";

/**
 * Decodes one Wallet response into a stable browser result.
 *
 * @param {Response} response
 * 	Fetch response to decode.
 * @returns {Promise<object>}
 * 	Decoded response with HTTP status.
 */
async function decodeWalletResponse(response) {
	const text = await response.text();
	let payload;

	try {
		payload = JSON.parse(text);
	} catch (error) {
		payload = {
			ok: false,
			error: text || `wallet_http_${response.status}`
		};
	}

	return {
		...payload,
		httpStatus: response.status
	};
}

/**
 * Fetches one read-only Wallet JSON response with authenticated cookies.
 *
 * @param {string} url
 * 	Wallet API URL.
 * @returns {Promise<object>}
 * 	Decoded response or normalized network failure.
 */
export async function getWalletJson(url) {
	try {
		const response = await fetch(url, {
			credentials: "include"
		});
		return await decodeWalletResponse(response);
	} catch (error) {
		return networkFailure(error);
	}
}

/**
 * Posts one explicit Wallet mutation using form encoding plus the custom action
 * header that ordinary cross-origin HTML forms cannot add.
 *
 * @param {string} url
 * 	Wallet mutation endpoint.
 * @param {object} body
 * 	Form fields to submit.
 * @returns {Promise<object>}
 * 	Decoded mutation response or normalized network failure.
 */
export async function postWalletJson(url, body = {}) {
	try {
		const response = await fetch(url, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
				[WALLET_ACTION_HEADER]: "1"
			},
			body: new URLSearchParams(body).toString()
		});
		return await decodeWalletResponse(response);
	} catch (error) {
		return networkFailure(error);
	}
}

/**
 * Normalizes browser transport errors without throwing through UI event handlers.
 *
 * @param {Error} error
 * 	Fetch/network exception.
 * @returns {object}
 * 	Stable failure record.
 */
function networkFailure(error) {
	return {
		ok: false,
		error: "wallet_network_error",
		detail: error.message
	};
}
