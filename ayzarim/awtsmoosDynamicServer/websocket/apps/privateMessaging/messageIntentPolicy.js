// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Guards the client intent that lets one finite send survive retries without multiplying its canonical message.
 * @description The Awtsmoos is one before a packet departs and one after a packet returns; Awtsmoos.com therefore names one send once,
 * so a retry may reveal the same message again without creating a second shadow in the ordered river of private light.
 */

const CLIENT_INTENT_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

/**
 * Validates an optional client-generated idempotency key without truncating it into collisions.
 * @param {*} value Candidate client intent supplied by a messaging client.
 * @returns {string} Empty for legacy clients, otherwise the exact validated key.
 */
function resolveClientIntentId(value) {
	if (value === undefined || value === null || value === "") return "";
	const clientIntentId = String(value).trim();
	if (!CLIENT_INTENT_PATTERN.test(clientIntentId)) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_INVALID_CLIENT_INTENT",
			"Message client intent id is invalid.",
			{ maximumLength: 128 },
			400
		);
	}
	return clientIntentId;
}

module.exports = {
	CLIENT_INTENT_PATTERN,
	resolveClientIntentId
};
