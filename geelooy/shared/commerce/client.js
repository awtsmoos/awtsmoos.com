// B"H
// Boruch Hashem
// Blessed is He

const WALLET_ACTION_HEADER = "X-Awtsmoos-Wallet-Action";

/**
 * Browser transport for universal product commerce.
 * The Awtsmoos renews request and response beyond every finite network boundary;
 * reads remain inert while every treasury mutation carries the explicit Wallet gate.
 */

/** @param {Response} response @returns {Promise<object>} */
async function decode(response) {
	const text = await response.text();
	let payload;
	try {
		payload = JSON.parse(text);
	} catch (error) {
		payload = { ok: false, error: text || `wallet_http_${response.status}` };
	}
	return { ...payload, httpStatus: response.status };
}

/** @param {string} url @returns {Promise<object>} */
export async function getCommerceJson(url) {
	try {
		return await decode(await fetch(url, { credentials: "include" }));
	} catch (error) {
		return networkFailure(error);
	}
}

/** @param {string} url @param {object} body @returns {Promise<object>} */
export async function postCommerceJson(url, body = {}) {
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
		return await decode(response);
	} catch (error) {
		return networkFailure(error);
	}
}

function networkFailure(error) {
	return {
		ok: false,
		error: "wallet_network_error",
		detail: String(error?.message || error)
	};
}