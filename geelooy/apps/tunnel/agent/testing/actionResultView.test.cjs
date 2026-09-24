//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const ResultView = require("../tools/fs/actionResultView.js");

/**
 * @file Proves nested result views preserve outer identity and never drop failed children.
 * @description The Awtsmoos keeps the outermost request id through every unwrapped envelope,
 * names each child's identity and retry keys, splits failures into partial success instead of
 * dropping them, and speaks the canonical testimony vocabulary on the final execution proof.
 */

test("nested batch with a failed child keeps outer request id, child identities, and cursor", () => {
	const envelope = {
		action: "actionBatch",
		ok: true,
		controlRequestId: "ctl_outer_1",
		requestKey: "reqkey-outer",
		dedupeKey: "dedupe-outer",
		cursor: "cursor-abc",
		results: [
			{
				action: "writeFile",
				actionId: "child-a",
				status: "completed",
				ok: true,
				controlRequestId: "ctl_child_a",
				requestKey: "reqkey-a",
				dedupeKey: "dedupe-a"
			},
			{
				action: "runCommand",
				actionId: "child-b",
				status: "failed",
				ok: false,
				error: "boom",
				controlRequestId: "ctl_child_b",
				requestKey: "reqkey-b",
				dedupeKey: "dedupe-b"
			}
		]
	};
	const view = ResultView.inspect(envelope);
	assert.equal(view.preserved.controlRequestId, "ctl_outer_1");
	assert.equal(view.preserved.requestKey, "reqkey-outer");
	assert.equal(view.preserved.dedupeKey, "dedupe-outer");
	assert.equal(view.preserved.cursor, "cursor-abc");
	assert.equal(view.children.length, 2);
	assert.equal(view.children[0].actionId, "child-a");
	assert.equal(view.children[0].ok, true);
	assert.equal(view.children[1].actionId, "child-b");
	assert.equal(view.children[1].ok, false);
	assert.equal(view.children[1].error, "boom");
	assert.equal(view.children[1].childIdentity.actionId, "child-b");
	assert.deepEqual(view.children[1].retry, { requestKey: "reqkey-b", dedupeKey: "dedupe-b" });
	assert.equal(view.partialSuccess.succeeded.length, 1);
	assert.equal(view.partialSuccess.succeeded[0].actionId, "child-a");
	assert.equal(view.partialSuccess.failed.length, 1);
	assert.equal(view.partialSuccess.failed[0].actionId, "child-b");
});

test("final execution proof testifies executed_terminal with named partial success", () => {
	const envelope = {
		action: "actionBatch",
		ok: true,
		controlRequestId: "ctl_outer_2",
		results: [
			{ action: "writeFile", actionId: "child-a", ok: true, status: "completed" },
			{ action: "runCommand", actionId: "child-b", ok: false, status: "failed", error: "boom" }
		]
	};
	const view = ResultView.inspect(envelope);
	assert.equal(view.executionProof.state, "executed_terminal");
	assert.equal(view.executionProof.controlRequestId, "ctl_outer_2");
	assert.equal(view.executionProof.ok, true);
	const nestedFailed = view.executionProof.nested.filter(entry => !entry.ok);
	assert.equal(nestedFailed.length, 1);
	assert.equal(nestedFailed[0].error, "boom");
});

test("preserve accumulator keeps the outermost identity through adapter unwrapping", () => {
	const envelope = {
		action: "previewActionResult",
		controlRequestId: "ctl_outer_3",
		requestKey: "reqkey-outer-3",
		nextCursor: "cursor-next",
		result: {
			action: "runCommand",
			ok: true,
			controlRequestId: "ctl_inner",
			requestKey: "reqkey-inner"
		}
	};
	const view = ResultView.inspect(envelope);
	assert.equal(view.preserved.controlRequestId, "ctl_outer_3");
	assert.equal(view.preserved.requestKey, "reqkey-outer-3");
	assert.equal(view.preserved.nextCursor, "cursor-next");
	assert.equal(view.executionProof.controlRequestId, "ctl_outer_3");
	assert.equal(view.executionProof.state, "executed_terminal");
	assert.equal(view.depth, 1);
	assert.ok(view.outerProof);
});

test("view keeps every field the old view exposed", () => {
	const view = ResultView.inspect({
		action: "tunnelRequestPending",
		accepted: true,
		consumerStarted: false,
		pending: true,
		mutationIntent: { mutation: true },
		controlRequestId: "ctl_test"
	});
	for (const key of ["terminal", "pending", "terminalResult", "executionProof", "transport", "depth"]) {
		assert.ok(key in view, `missing view field ${key}`);
	}
	for (const key of ["accepted", "consumerStarted", "executed", "terminal", "pending", "mutationAmbiguous",
		"safeToRedispatch", "observeOnly", "controlRequestId", "jobId", "retryPayload"]) {
		assert.ok(key in view.executionProof, `missing proof field ${key}`);
	}
	assert.equal(view.executionProof.accepted, true);
	assert.equal(view.executionProof.executed, false);
	assert.equal(view.executionProof.mutationAmbiguous, true);
	assert.equal(view.executionProof.observeOnly, true);
	assert.equal(view.executionProof.safeToRedispatch, false);
	assert.equal(view.terminal, false);
	assert.equal(view.pending, true);
});
