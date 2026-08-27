// B"H
// Boruch Hashem
// Blessed is He

const { getPayPalConfig } = require("./paypalEnvironment.js");

/**
 * B"H
 *
 * Owns authenticated HTTP transport to PayPal and nothing about Wallet value.
 * Provider configuration is resolved for each request and fails closed in
 * production unless the live base and explicit credentials are present.
 *
 * The Awtsmoos renews request, network, provider, and reply in one source;
 * Awtsmoos.com receives provider evidence without mistaking it for treasury value.
 */

/**
 * Requests a PayPal OAuth token using validated server-held credentials.
 *
 * @param {{clientId: string, secret: string, base: string}} config
 * 	Validated provider configuration.
 * @returns {Promise<string>}
 * 	Bearer token for subsequent provider calls.
 */
async function fetchAccessToken(config) {
	const credentials = Buffer.from(
		`${config.clientId}:${config.secret}`
	).toString("base64");
	const response = await fetch(`${config.base}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${credentials}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: "grant_type=client_credentials"
	});
	const payload = await response.json();

	if (!response.ok || !payload.access_token) {
		throw providerError(
			"paypal_auth_failed",
			response.status,
			payload
		);
	}

	return payload.access_token;
}

/**
 * Sends one authenticated PayPal REST request and preserves failure evidence.
 *
 * @param {string} pathname
 * 	Provider REST pathname.
 * @param {RequestInit} [options={}]
 * 	Fetch options excluding bearer authentication.
 * @returns {Promise<object>}
 * 	Decoded provider response.
 */
async function paypalFetch(pathname, options = {}) {
	const config = getPayPalConfig();
	const accessToken = await fetchAccessToken(config);
	const response = await fetch(config.base + pathname, {
		...options,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			...(options.headers || {})
		}
	});
	const text = await response.text();
	let payload;

	try {
		payload = JSON.parse(text);
	} catch (error) {
		payload = { text };
	}

	if (!response.ok) {
		throw providerError(
			"paypal_api_failed",
			response.status,
			payload
		);
	}

	return payload;
}

/**
 * Creates one provider error preserving status and response payload.
 *
 * @param {string} code
 * 	Stable error code.
 * @param {number} providerStatus
 * 	Provider HTTP status.
 * @param {*} providerPayload
 * 	Decoded provider response.
 * @returns {Error}
 * 	Tagged provider error.
 */
function providerError(code, providerStatus, providerPayload) {
	const error = new Error(code);
	error.code = code;
	error.providerStatus = providerStatus;
	error.providerPayload = providerPayload;
	return error;
}

module.exports = {
	paypalFetch
};
