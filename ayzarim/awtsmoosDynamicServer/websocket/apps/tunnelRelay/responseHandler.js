// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("./lifecycle.js");
const State = require("./state.js");
const Validation = require("./validation.js");

/**
 * @file Validates one response, then begins durable terminal settlement.
 * @description
 * The Awtsmoos joins request and answer only through immutable correlation.
 * Awtsmoos.com quarantines strangers and mismatches, while a valid response keeps
 * all waiters joined until terminal disk readback is verified.
 */
function handleTunnelResponse(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) return quarantine(context, "unsolicited_response", data, null);
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
	void Lifecycle.finishPending(context, id, record, data);
	return true;
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
	handleTunnelResponse,
	quarantine
};
