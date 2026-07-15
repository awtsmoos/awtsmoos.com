// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./request-retry-identity.js");
const Reconcile = require("./request-retry-reconcile.js");
const Shapes = require("./request-retry-shapes.js");
const Store = require("./request-retry-store.js");

/**
 * B"H
 *
 * Retry polling opens one existing deed and never enqueues another. The Awtsmoos
 * renews memory, disk receipt, and destination hash together; reconciliation runs
 * only for a pending record hydrated after process-memory loss.
 */
function begin(input = {}) {
	const payload = input.payload || input;
	const identity = Identity.requestIdentity(payload, input.data || {});
	return Store.begin(identity, payload);
}

function poll(input = {}) {
	const identity = Identity.retryIdentity(input.payload || input, input.data || {});
	let record = Store.get(identity.controlRequestId);
	if (!record) {
		return Shapes.missing(identity.controlRequestId, identity.requestedAction);
	}
	if (identity.requestedAction && record.requestedAction !== identity.requestedAction) {
		return Shapes.conflict(record, identity.requestedAction);
	}
	if (record.state === "pending" && record.hydratedAfterRestart === true) {
		record = recoverPending(record) || record;
	}
	return record.state === "completed"
		? Shapes.completed(record)
		: Shapes.pending(record);
}

function recoverPending(record) {
	const recovered = Reconcile.recover(record);
	if (!recovered) return null;
	return Store.complete(record.controlRequestId, recovered);
}

module.exports = {
	begin,
	collect: Store.collect,
	complete: Store.complete,
	poll,
	progress: Store.progress,
	recoverPending,
	requestIdentity: Identity.requestIdentity,
	reset: Store.reset,
	retryIdentity: Identity.retryIdentity,
	snapshot: Store.snapshot
};
