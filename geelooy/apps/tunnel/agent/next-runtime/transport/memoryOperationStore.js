// B"H
const Lifecycle = require("../protocol/lifecycle.js");

/**
 * B"H — This memory store is a reference vessel, not production durability.
 * Its bounds and indexes make semantics testable before a disk-backed store is
 * trusted with living operations.
 */
function createMemoryOperationStore(options = {}) {
	const operations = new Map();
	const byControlRequest = new Map();
	const byIdempotency = new Map();
	const maxOperations = positive(options.maxOperations, 10000);

	function insert(record) {
		if (operations.has(record.operationId)) throw conflict("operation_exists");
		if (operations.size >= maxOperations) evictTerminal();
		if (operations.size >= maxOperations) throw conflict("operation_store_full");
		operations.set(record.operationId, clone(record));
		byControlRequest.set(record.controlRequestId, record.operationId);
		if (record.idempotencyKey) byIdempotency.set(record.idempotencyKey, record.operationId);
		return get(record.operationId);
	}

	function get(operationId) {
		const record = operations.get(operationId);
		return record ? clone(record) : null;
	}

	function findByControlRequest(controlRequestId) {
		return get(byControlRequest.get(String(controlRequestId || "")));
	}

	function findByIdempotencyKey(idempotencyKey) {
		return get(byIdempotency.get(String(idempotencyKey || "")));
	}

	function replace(record, expectedRevision) {
		const current = operations.get(record.operationId);
		if (!current) throw conflict("operation_missing");
		if (expectedRevision !== undefined && current.revision !== expectedRevision) {
			throw conflict("operation_revision_conflict", current.revision);
		}
		operations.set(record.operationId, clone(record));
		return get(record.operationId);
	}

	function list() {
		return [...operations.values()].map(clone);
	}

	function snapshot() {
		return {
			operations: operations.size,
			active: [...operations.values()].filter(record => !Lifecycle.isTerminal(record.state)).length,
			maxOperations
		};
	}

	function evictTerminal() {
		for (const [operationId, record] of operations) {
			if (!Lifecycle.isTerminal(record.state)) continue;
			operations.delete(operationId);
			byControlRequest.delete(record.controlRequestId);
			if (record.idempotencyKey) byIdempotency.delete(record.idempotencyKey);
			return true;
		}
		return false;
	}

	return { findByControlRequest, findByIdempotencyKey, get, insert, list, replace, snapshot };
}

function clone(value) {
	return structuredClone(value);
}

function conflict(code, currentRevision) {
	const error = new Error(code);
	error.code = code;
	error.currentRevision = currentRevision;
	return error;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { createMemoryOperationStore };
