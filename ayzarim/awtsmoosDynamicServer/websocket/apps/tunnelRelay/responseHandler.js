// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("./lifecycle.js");
const State = require("./state.js");
const Validation = require("./validation.js");

/**
	* @file Settles valid responses and re-acknowledges already durable duplicates.
	* @description
	* The Awtsmoos lets an ACK disappear without making the answer uncertain.
	* Awtsmoos.com hydrates terminal truth and repeats settlement acknowledgment.
	*/
function handleTunnelResponse(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) return handleDuplicate(context, client, data, id);
	if (!client || client.registrationKey !== record.registrationKey) {
		return quarantine(context, "foreign_registration_response", data, record.expected);
	}
	const validation = Validation.validateTunnelResponse(record.expected, data);
	if (!validation.ok) {
		return quarantineSettledTransport(
			context,
			client,
			"correlation_mismatch",
			data,
			id,
			record.expected,
			validation
		);
	}
	void Promise.resolve(Lifecycle.finishPending(context, id, record, data))
		.then(() => acknowledge(client, data, id))
		.catch(error => State.quarantine(context, {
			reason: "response_settlement_failed",
			data,
			expected: record.expected,
			validation: { error: error.message }
		}));
	return true;
}

function handleDuplicate(context, client, data, id) {
	const expected = { registrationKey: client?.registrationKey || "" };
	void State.hydrate(context, id, expected).then(record => {
		if (record && ["completed", "failed", "expired"].includes(record.state)) {
			acknowledge(client, data, id);
			return;
		}
		if (record?.state === "pending") {
			return settleRecoveredPending(context, client, data, id, record);
		}
		quarantine(context, "unsolicited_response", data, expected);
		if (!record) acknowledge(client, data, id);
	}).catch(error => State.quarantine(context, {
		reason: "duplicate_response_hydration_failed",
		data,
		expected,
		validation: { error: error.message }
	}));
	return true;
}

async function settleRecoveredPending(context, client, data, id, record) {
	if (!client || client.registrationKey !== record.expected?.registrationKey) {
		return quarantine(
			context,
			"foreign_registration_recovered_response",
			data,
			record.expected
		);
	}
	const validation = Validation.validateTunnelResponse(record.expected, data);
	if (!validation.ok) {
		return quarantineSettledTransport(
			context,
			client,
			"recovered_response_correlation_mismatch",
			data,
			id,
			record.expected,
			validation
		);
	}
	await State.rememberCompleted(context, id, data, record.expected);
	acknowledge(client, data, id);
	return true;
}

function acknowledge(client, data, id) {
	const transportReceiptId = String(data.transportReceiptId || id);
	try {
		client.send({
			type: "TUNNEL_RESPONSE_ACK",
			id,
			transportReceiptId,
			settledAt: new Date().toISOString()
		});
		return true;
	} catch {
		return false;
	}
}

function quarantine(context, reason, data, expected, validation = null) {
	State.quarantine(context, { reason, data, expected, validation });
	return false;
}

function quarantineSettledTransport(
	context,
	client,
	reason,
	data,
	id,
	expected,
	validation = null
) {
	quarantine(context, reason, data, expected, validation);
	acknowledge(client, data, id);
	return false;
}

module.exports = {
	acknowledge,
	handleDuplicate,
	handleTunnelResponse,
	quarantine,
	quarantineSettledTransport,
	settleRecoveredPending
};
