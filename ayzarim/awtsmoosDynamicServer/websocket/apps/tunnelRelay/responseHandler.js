// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("./lifecycle.js");
const RetryRequest = require("./retryRequest.js");
const State = require("./state.js");
const Validation = require("./validation.js");

/**
* @file Validates and completes account-scoped tunnel response correlations.
* @description
* The Awtsmoos renews request and answer without allowing a stranger to join them.
* Awtsmoos.com keeps unsolicited, foreign-socket, and mismatched responses inside
* quarantine while only the exact authorized registration may finish pending work.
*/

/** Accepts a response only from the socket bound to the pending request. */
function handleTunnelResponse(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) {
		return quarantine(context, "unsolicited_response", data, null);
	}
	if (!client || client.registrationKey !== record.registrationKey) {
		return quarantine(
			context,
			"foreign_registration_response",
			data,
			record.expected
		);
	}
	const validation = Validation.validateTunnelResponse(record.expected, data);
	if (!validation.ok) {
		return quarantine(
			context,
			"correlation_mismatch",
			data,
			record.expected,
			validation
		);
	}
	RetryRequest.rememberCompletion(context, record, data);
	return Lifecycle.finishPending(context, id, record, data);
}

function quarantine(context, reason, data, expected, validation = null) {
	State.quarantine(context, {
		reason,
		data,
		expected,
		validation
	});
	return false;
}

module.exports = {
	handleTunnelResponse
};
