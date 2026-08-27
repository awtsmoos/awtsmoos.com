// B"H
const Canonical = require("../protocol/canonical.js");
const Identity = require("../protocol/identity.js");
const Lifecycle = require("../protocol/lifecycle.js");
const H = require("./coordinatorHelpers.js");

/**
 * B"H — Many callers may wait at one operation, but no response crosses the
 * threshold unless its whole lineage agrees. At-least-once delivery becomes safe
 * through exactly-once acceptance of the canonical request identity.
 */
function createOperationCoordinator(options = {}) {
	const store = options.store;
	const quarantine = options.quarantine;
	const waiters = new Map();
	const maxWaiters = H.positive(options.maxWaitersPerOperation, 1000);
	let sequence = 0;

	function accept(request = {}) {
		const validation = Identity.validateRequest(request);
		if (!validation.ok) return validation;
		const requestHash = Canonical.hash(H.hashableRequest(request));
		const existing = store.findByControlRequest(request.controlRequestId) ||
			(request.idempotencyKey ? store.findByIdempotencyKey(request.idempotencyKey) : null);
		if (existing) return H.duplicateDecision(existing, requestHash);
		let operation = H.newRecord(request, request.operationId || `operation_${++sequence}`);
		operation.expected = Identity.expectedFromRequest(request);
		operation = Lifecycle.transition(operation, "accepted", {
			at: H.timestamp(),
			reason: "request_accepted"
		});
		return { ok: true, kind: "created", operation: store.insert(operation) };
	}

	function markSent(operationId) {
		const current = required(operationId);
		const next = Lifecycle.transition(current, "sent", {
			at: H.timestamp(),
			reason: "delivery_requested"
		});
		return store.replace(next, current.revision);
	}

	function receive(response = {}) {
		const operation = store.findByControlRequest(response.controlRequestId);
		if (!operation) return rejectFrame("unsolicited_response", null, response);
		const comparison = Identity.compare(operation.expected, response);
		if (!comparison.ok) return rejectFrame("correlation_mismatch", operation, { response, comparison });
		const responseHash = Canonical.hash(response);
		if (Lifecycle.isTerminal(operation.state)) return duplicateFinal(operation, responseHash, response);
		let next = operation;
		if (["accepted", "sent", "acknowledged"].includes(next.state)) {
			next = Lifecycle.transition(next, "running", { at: H.timestamp(), reason: "response_arrived" });
		}
		next = Lifecycle.transition(next, response.ok === false ? "failed" : "completed", {
			at: H.timestamp(),
			reason: "final_receipt"
		});
		next = { ...next, response: structuredClone(response), responseHash };
		const saved = store.replace(next, operation.revision);
		resolveWaiters(saved);
		return { ok: true, kind: "completed", operation: saved };
	}

	function wait(operationId) {
		const operation = required(operationId);
		if (Lifecycle.isTerminal(operation.state)) return Promise.resolve(operation);
		const group = waiters.get(operationId) || new Set();
		if (group.size >= maxWaiters) return Promise.reject(H.error("waiter_limit_reached"));
		waiters.set(operationId, group);
		return new Promise(resolve => group.add(resolve));
	}

	function duplicateFinal(operation, responseHash, response) {
		return operation.responseHash === responseHash
			? { ok: true, kind: "duplicate_final", operation }
			: rejectFrame("conflicting_final", operation, response);
	}

	function rejectFrame(reason, operation, details) {
		quarantine.add({ reason, operationId: operation?.operationId || "", details });
		return { ok: false, error: reason, operation };
	}

	function resolveWaiters(operation) {
		for (const resolve of waiters.get(operation.operationId) || []) resolve(operation);
		waiters.delete(operation.operationId);
	}

	function required(operationId) {
		const operation = store.get(operationId);
		if (!operation) throw H.error("operation_not_found");
		return operation;
	}

	function snapshot() {
		return { ...store.snapshot(), waiterGroups: waiters.size, quarantine: quarantine.snapshot() };
	}

	return { accept, markSent, receive, snapshot, wait };
}

module.exports = { createOperationCoordinator, hashableRequest: H.hashableRequest };
