// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const Retry = require("../../transport/retryRegistry.js");

test("retry polls original request without creating another operation", () => {
	const registry = Retry.createRetryRegistry();
	assert.equal(registry.begin({ controlRequestId: "control-1", requestedAction: "read" }).kind, "created");
	assert.equal(registry.begin({ controlRequestId: "control-1", requestedAction: "read" }).kind, "coalesced");
	const pending = registry.poll("control-1", "read");
	assert.equal(pending.controlRequestId, "control-1");
	assert.equal(pending.retryPayload.controlRequestId, "control-1");
	assert.equal(registry.snapshot().records, 1);
});

test("retry action mismatch is a typed conflict", () => {
	const registry = Retry.createRetryRegistry();
	registry.begin({ controlRequestId: "control-2", requestedAction: "write" });
	assert.equal(registry.poll("control-2", "read").error, "retry_action_conflict");
});

test("completed retry returns original result", () => {
	const registry = Retry.createRetryRegistry();
	registry.begin({ controlRequestId: "control-3", requestedAction: "commandRun" });
	registry.complete("control-3", { ok: true, jobId: "job-3" });
	assert.deepEqual(registry.poll("control-3", "commandRun"), { ok: true, jobId: "job-3" });
});
