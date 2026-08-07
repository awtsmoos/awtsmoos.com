// B"H
// Boruch Hashem
// Blessed is He

const Duplicate = require("./responseDuplicate.js");
const Generation = require("./responseGeneration.js");
const Lifecycle = require("./lifecycle.js");
const Protocol = require("./responseProtocol.js");
const State = require("./state.js");
const Validation = require("./validation.js");

/**
 * @file Settles an in-memory pending response only after exact durable correlation.
 * @description
 * The Awtsmoos lets ordinary terminal settlement remain a small, legible doorway.
 * Awtsmoos.com sends missing-memory and cross-generation testimony into a separate
 * reconciliation vessel, while mismatches remain unacknowledged and durably visible.
 */
function handleTunnelResponse(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) return Duplicate.handle(context, client, data, id);
	if (!Generation.maySettle(record, client, data)) {
		return Protocol.quarantine(
			context,
			"foreign_registration_response",
			data,
			record.expected
		);
	}
	const validation = Validation.validateTunnelResponse(record.expected, data);
	if (!validation.ok) {
		return Protocol.quarantine(
			context,
			"correlation_mismatch",
			data,
			record.expected,
			validation
		);
	}
	void Promise.resolve(Lifecycle.finishPending(context, id, record, data))
		.then(() => Protocol.acknowledge(client, data, id))
		.catch(error => Protocol.quarantineError(
			context,
			"response_settlement_failed",
			data,
			record.expected,
			error
		));
	return true;
}

/** Historical export retained for callers that settle a missing-memory response. */
function handleDuplicate(context, client, data, id) {
	return Duplicate.handle(context, client, data, id);
}

module.exports = {
	acknowledge: Protocol.acknowledge,
	handleDuplicate,
	handleTunnelResponse,
	quarantine: Protocol.quarantine,
	settleHydrated: Duplicate.settle,
	settleRecoveredPending: Duplicate.settlePending
};
