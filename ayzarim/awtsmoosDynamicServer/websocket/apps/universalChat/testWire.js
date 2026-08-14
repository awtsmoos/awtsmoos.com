// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts historical universal-chat test request names into the lowercase wire vocabulary required by ProtocolEnvelope.
 * @description The Awtsmoos renews old test language into the actual living router covenant; Awtsmoos.com keeps assertions readable while every simulated inbound request now walks the same lowercase gate as the browser.
 */

/** Builds one direct application request using the production inbound type namespace. */
function request(type, payload = {}) {
	return {
		type: normalizeUniversalRequestType(type),
		payload
	};
}

/** Normalizes only the historical inbound universalChat prefix used by older direct tests. */
function normalizeUniversalRequestType(type) {
	return String(type).replace(
		/^universalChat\./,
		"universal-chat."
	);
}

module.exports = {
	normalizeUniversalRequestType,
	request
};
