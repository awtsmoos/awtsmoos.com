// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Shapes = require("../lib/runtime/request-retry-shapes.js");

/**
 * @file Proves every retry shape testifies its execution state explicitly.
 * @description The Awtsmoos preserves a deed without granting permission to repeat it.
 * Awtsmoos.com proves pending, conflict, missing, and completed shapes each carry one
 * canonical testimony state, so no caller must infer whether a mutation may be resent.
 */

test("pending testifies accepted-not-executed, observe-only, never replayable", () => {
	const shape = Shapes.pending({
		controlRequestId: "ctl_1",
		requestedAction: "write",
		mutationIntent: { mutation: true },
		durable: { enabled: true, replaySafe: false },
		progress: {}
	});
	assert.equal(shape.testimony.state, "accepted_not_executed");
	assert.equal(shape.testimony.testimonyState, "accepted_not_executed");
	assert.equal(shape.testimony.accepted, true);
	assert.equal(shape.testimony.executed, false);
	assert.equal(shape.testimony.observeOnly, true);
	assert.equal(shape.testimony.mutationPossible, true);
	assert.equal(shape.testimony.mutationAmbiguous, true);
	assert.equal(shape.testimony.safeToReplay, false);
	assert.equal(shape.testimony.safeToRedispatch, false);
	assert.equal(shape.safeToReplay, false);
});

test("pending after restart testifies interrupted-ambiguous reconciliation", () => {
	const shape = Shapes.pending({
		controlRequestId: "ctl_2",
		requestedAction: "write",
		hydratedAfterRestart: true,
		durable: { enabled: true, replaySafe: false },
		mutationIntent: { mutation: true },
		progress: {}
	});
	assert.equal(shape.testimony.state, "interrupted_ambiguous");
	assert.equal(shape.reconciliationRequired, true);
	assert.equal(shape.testimony.observeOnly, true);
	assert.equal(shape.testimony.safeToReplay, false);
});

test("conflict testifies fingerprint mismatch and blocks resend", () => {
	const shape = Shapes.conflict({ controlRequestId: "ctl_3", requestedAction: "write" }, "read");
	assert.equal(shape.testimony.state, "fingerprint_conflict");
	assert.equal(shape.testimony.terminal, true);
	assert.equal(shape.testimony.observeOnly, true);
	assert.equal(shape.testimony.safeToReplay, false);
	assert.equal(shape.error, "retry_action_conflict");
});

test("missing testifies unknown request", () => {
	const shape = Shapes.missing("ctl_nope", "write");
	assert.equal(shape.testimony.state, "unknown_request");
	assert.equal(shape.testimony.accepted, false);
	assert.equal(shape.testimony.executed, false);
	assert.equal(shape.testimony.safeToReplay, false);
});

test("completed testifies replayed terminal result safe to return", () => {
	const shape = Shapes.completed({
		controlRequestId: "ctl_4",
		requestedAction: "read",
		result: { ok: true, action: "read", content: "hello" }
	});
	assert.equal(shape.testimony.state, "replayed_terminal");
	assert.equal(shape.testimony.executed, true);
	assert.equal(shape.testimony.terminal, true);
	assert.equal(shape.testimony.safeToReplay, true);
	assert.equal(shape.testimony.mutationAmbiguous, false);
	assert.equal(shape.ok, true);
	assert.equal(shape.retryOf, "ctl_4");
});

test("testimony agrees with the shared testimony helper vocabulary", () => {
	const Testimony = require("../lib/runtime/actionExecutionTestimony.js");
	for (const shape of [
		Shapes.pending({ controlRequestId: "a", requestedAction: "write", progress: {} }),
		Shapes.conflict({ controlRequestId: "b", requestedAction: "write" }, "read"),
		Shapes.missing("c", "write"),
		Shapes.completed({ controlRequestId: "d", requestedAction: "read", result: { ok: true } })
	]) {
		assert.ok(Testimony.TESTIMONY_STATES.includes(shape.testimony.state));
		assert.equal(Testimony.testify({ testimonyState: shape.testimony.state }).state, shape.testimony.state);
	}
});
