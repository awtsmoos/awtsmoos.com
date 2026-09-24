// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Testimony = require("../lib/runtime/actionExecutionTestimony.js");

/**
 * @file Proves every result envelope yields one explicit execution testimony.
 * @description The Awtsmoos never confuses acceptance with execution. Awtsmoos.com proves
 * pending receipts testify accepted-not-executed and observe-only, terminal results testify
 * execution, conflicts testify fingerprint mismatch, and ambiguity blocks replay.
 */

test("pending mutation receipt testifies accepted, not executed, observe-only", () => {
	const testimony = Testimony.testify({
		action: "tunnelRequestPending",
		accepted: true,
		consumerStarted: false,
		pending: true,
		mutationIntent: { mutation: true },
		controlRequestId: "ctl_test"
	});
	assert.equal(testimony.state, "accepted_not_executed");
	assert.equal(testimony.accepted, true);
	assert.equal(testimony.executed, false);
	assert.equal(testimony.terminal, false);
	assert.equal(testimony.observeOnly, true);
	assert.equal(testimony.mutation.possible, true);
	assert.equal(testimony.mutationAmbiguous, true);
	assert.equal(testimony.safeToReplay, false);
	assert.equal(testimony.safeToRedispatch, false);
	assert.equal(testimony.controlRequestId, "ctl_test");
});

test("completed result testifies executed terminal", () => {
	const testimony = Testimony.testify({ action: "write", ok: true, controlRequestId: "ctl_done" });
	assert.equal(testimony.state, "executed_terminal");
	assert.equal(testimony.executed, true);
	assert.equal(testimony.terminal, true);
	assert.equal(testimony.observeOnly, false);
});

test("conflict error testifies fingerprint conflict and blocks resend", () => {
	const testimony = Testimony.testify({ action: "retryAction", ok: false, error: "control_request_id_conflict", controlRequestId: "ctl_x" });
	assert.equal(testimony.state, "fingerprint_conflict");
	assert.equal(testimony.terminal, true);
	assert.equal(testimony.observeOnly, true);
	assert.equal(testimony.safeToReplay, false);
});

test("missing request testifies unknown request", () => {
	const testimony = Testimony.testify({ action: "retryAction", ok: false, error: "retry_request_not_found", controlRequestId: "ctl_nope" });
	assert.equal(testimony.state, "unknown_request");
	assert.equal(testimony.executed, false);
});

test("reconciliation maps crash boundaries to testimony states", () => {
	assert.equal(Testimony.testify({ reconciliation: { state: "process_missing_after_restart" } }).state, "interrupted_ambiguous");
	assert.equal(Testimony.testify({ reconciliation: { state: "never_started" } }).state, "never_started_failed");
	assert.equal(Testimony.testify({ reconciliation: { state: "running_unverified" } }).state, "executing");
});

test("duplicate replay of a terminal result is safe to replay", () => {
	const testimony = Testimony.testify({ action: "write", ok: true, replayed: true, controlRequestId: "ctl_dup" });
	assert.equal(testimony.state, "replayed_terminal");
	assert.equal(testimony.safeToReplay, true);
});

test("nested children testify without losing their identities", () => {
	const testimony = Testimony.testify({
		action: "actionBatch",
		ok: true,
		children: [
			{ action: "write", ok: true, controlRequestId: "ctl_child_1" },
			{ action: "read", ok: false, error: "file_not_found", controlRequestId: "ctl_child_2" }
		]
	});
	assert.equal(testimony.nested.length, 2);
	assert.equal(testimony.nested[0].state, "executed_terminal");
	assert.equal(testimony.nested[0].controlRequestId, "ctl_child_1");
	assert.equal(testimony.nested[1].state, "executed_failed");
	assert.equal(testimony.nested[1].error, "file_not_found");
});

test("timestamps derive duration and side effects pass through", () => {
	const testimony = Testimony.testify({
		action: "write",
		ok: true,
		startedAt: "2026-09-18T17:00:00.000Z",
		completedAt: "2026-09-18T17:00:01.500Z",
		sideEffects: [{ kind: "file_written", target: "a/b.txt" }]
	});
	assert.equal(testimony.durationMs, 1500);
	assert.deepEqual(testimony.sideEffects, [{ kind: "file_written", target: "a/b.txt" }]);
});

test("garbage input yields unknown instead of a guess", () => {
	const testimony = Testimony.testify(null);
	assert.equal(testimony.state, "unknown");
	assert.equal(testimony.executed, false);
	assert.equal(testimony.safeToRedispatch, false);
});
