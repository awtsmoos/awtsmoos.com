// B"H
const Canonical = require("../protocol/canonical.js");

function hashableRequest(request) {
	return {
		action: request.action,
		root: request.root,
		cwd: request.cwd || "",
		payload: request.payload || null
	};
}

function duplicateDecision(existing, requestHash) {
	return existing.requestHash === requestHash
		? { ok: true, kind: "coalesced", operation: existing }
		: { ok: false, error: "idempotency_conflict", operation: existing };
}

function newRecord(request, operationId) {
	const now = timestamp();
	return {
		operationId,
		controlRequestId: request.controlRequestId,
		idempotencyKey: request.idempotencyKey || "",
		requestHash: Canonical.hash(hashableRequest(request)),
		request: structuredClone(request),
		state: "created",
		revision: 0,
		createdAt: now,
		updatedAt: now,
		history: []
	};
}

function timestamp() {
	return new Date().toISOString();
}

function error(code) {
	const failure = new Error(code);
	failure.code = code;
	return failure;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { duplicateDecision, error, hashableRequest, newRecord, positive, timestamp };
