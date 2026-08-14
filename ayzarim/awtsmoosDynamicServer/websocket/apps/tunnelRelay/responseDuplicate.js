// B"H
// Boruch Hashem
// Blessed is He

const Compatibility = require("./responseCompatibility.js");
const Generation = require("./responseGeneration.js");
const Protocol = require("./responseProtocol.js");
const State = require("./state.js");
const Validation = require("./validation.js");

/**
 * @file Reconciles terminal responses after pending memory or socket generation changed.
 * @description Awtsmoos.com releases device custody only after exact validation or
 * durable authenticated-orphan testimony; correlation mismatches remain unacknowledged.
 */
function handle(context, client, data, id) {
	const lookup = Generation.lookupExpected(client, data);
	void State.hydrate(context, id, lookup)
		.then(record => settle(context, client, data, id, record, lookup))
		.catch(error => Protocol.quarantineError(
			context,
			"duplicate_response_hydration_failed",
			data,
			lookup,
			error
		));
	return true;
}

async function settle(context, client, data, id, record, lookup) {
	if (!record) return await settleAuthenticatedOrphan(
		context,
		client,
		data,
		id,
		lookup
	);
	if (record.state === "pending") {
		return await settlePending(context, client, data, id, record);
	}
	if (!["completed", "failed", "expired"].includes(record.state)) {
		return Protocol.quarantine(
			context,
			"unknown_durable_response_state",
			data,
			record.expected
		);
	}
	if (!validSettlement(context, client, data, record, "terminal_duplicate")) {
		return false;
	}
	if (record.state !== "completed") {
		const committed = await State.rememberReconciliation(
			context,
			id,
			data,
			record.expected,
			{ registrationKey: client.registrationKey, observedAt: new Date().toISOString() }
		);
		if (!committed?.reconciliation) {
			return Protocol.quarantine(
				context,
				"late_terminal_not_persisted",
				data,
				record.expected
			);
		}
	}
	return Protocol.acknowledge(client, data, id);
}

async function settleAuthenticatedOrphan(context, client, data, id, lookup) {
	if (!Generation.sameGeneration({ expected: lookup }, client)) {
		return Protocol.quarantine(context, "unsolicited_response", data, lookup);
	}
	const committed = await State.rememberCompleted(context, id, data, lookup);
	if (!committed || !["completed", "failed"].includes(committed.state)) {
		return Protocol.quarantine(context, "orphan_response_not_persisted", data, lookup);
	}
	return Protocol.acknowledge(client, data, id);
}

async function settlePending(context, client, data, id, record) {
	if (!validSettlement(context, client, data, record, "recovered_response")) {
		return false;
	}
	await State.rememberCompleted(context, id, data, record.expected);
	Protocol.acknowledge(client, data, id);
	return true;
}

function validSettlement(context, client, data, record, prefix) {
	if (!Generation.maySettle(record, client, data)) {
		Protocol.quarantine(context, `${prefix}_foreign_registration`, data, record.expected);
		return false;
	}
	const validation = Validation.validateTunnelResponse(record.expected, data);
	if (validation.ok || Compatibility.acceptsMissingStream(record, data, validation)) return true;
	Protocol.quarantine(
		context,
		`${prefix}_correlation_mismatch`,
		data,
		record.expected,
		validation
	);
	return false;
}

module.exports = { handle, settle, settleAuthenticatedOrphan, settlePending, validSettlement };
