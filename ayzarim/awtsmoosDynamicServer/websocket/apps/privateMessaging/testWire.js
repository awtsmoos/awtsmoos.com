// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts historical private-messaging test request names into the lowercase wire vocabulary required by ProtocolEnvelope.
 * @description The Awtsmoos renews old test words into the living consent router; Awtsmoos.com keeps contract assertions readable while every simulated inbound request walks the same lowercase gate as the browser.
 */

/** Builds one direct private application request using production inbound type names. */
function request(type, payload = {}) {
	return {
		type: normalizePrivateRequestType(type),
		payload
	};
}

/** Normalizes only the historical privateMessaging prefix used by direct tests. */
function normalizePrivateRequestType(type) {
	return String(type).replace(
		/^privateMessaging\./,
		"private-messaging."
	);
}

module.exports = {
	normalizePrivateRequestType,
	request
};
