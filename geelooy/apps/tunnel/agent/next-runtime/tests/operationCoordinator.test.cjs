// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const Runtime = require("../index.js");
const F = require("./helpers/fixtures.cjs");

function harness() {
	const store = Runtime.createMemoryOperationStore({ maxOperations: 100 });
	const quarantine = Runtime.createQuarantineLedger({ maxEntries: 20 });
	const coordinator = Runtime.createOperationCoordinator({ store, quarantine });
	return { coordinator, quarantine, store };
}

test("same idempotency key and payload coalesce", () => {
	const { coordinator } = harness();
	const input = F.request("same");
	const first = coordinator.accept(input);
	const second = coordinator.accept({ ...input });
	assert.equal(first.kind, "created");
	assert.equal(second.kind, "coalesced");
	assert.equal(second.operation.operationId, first.operation.operationId);
});

test("same idempotency key with different payload conflicts", () => {
	const { coordinator } = harness();
	const input = F.request("conflict");
	coordinator.accept(input);
	const result = coordinator.accept({ ...input, payload: { id: "conflict", value: "different" } });
	assert.equal(result.ok, false);
	assert.equal(result.error, "idempotency_conflict");
});

test("wrong response first is quarantined and valid response still completes", async () => {
	const { coordinator, quarantine } = harness();
	const input = F.request("wrong-first");
	const accepted = coordinator.accept(input);
	coordinator.markSent(accepted.operation.operationId);
	const waiting = coordinator.wait(accepted.operation.operationId);
	const wrong = coordinator.receive(F.response(input, { jobId: "job-other" }));
	assert.equal(wrong.error, "correlation_mismatch");
	assert.equal(quarantine.snapshot().entries, 1);
	const valid = coordinator.receive(F.response(input));
	assert.equal(valid.kind, "completed");
	assert.equal((await waiting).state, "completed");
});

test("stale epoch cannot complete a request", () => {
	const { coordinator } = harness();
	const input = F.request("stale");
	const accepted = coordinator.accept(input);
	coordinator.markSent(accepted.operation.operationId);
	const result = coordinator.receive(F.response(input, { connectionEpoch: 6 }));
	assert.equal(result.error, "correlation_mismatch");
	assert.equal(coordinator.snapshot().active, 1);
});

test("identical final is coalesced and conflicting final is quarantined", () => {
	const { coordinator, quarantine } = harness();
	const input = F.request("final");
	const accepted = coordinator.accept(input);
	coordinator.markSent(accepted.operation.operationId);
	const response = F.response(input);
	assert.equal(coordinator.receive(response).kind, "completed");
	assert.equal(coordinator.receive({ ...response }).kind, "duplicate_final");
	const conflict = coordinator.receive({ ...response, result: { accepted: "other" } });
	assert.equal(conflict.error, "conflicting_final");
	assert.equal(quarantine.snapshot().entries, 1);
});
