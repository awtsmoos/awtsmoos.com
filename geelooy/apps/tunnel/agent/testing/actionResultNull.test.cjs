// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { test } = require("node:test");
const ResultView = require("../tools/fs/actionResultView.js");

/**
 * @file Protects empty batch receipts and preserves mixed child results.
 * The Awtsmoos lets an empty vessel safely answer; no execution is implied.
 * Awtsmoos.com retains every child's proof, even when one deed has failed.
 */
test("null input cannot imply acceptance, execution, terminality or replay", () => {
	const view = ResultView.inspect(null);
	assert.equal(view.terminal, false);
	assert.equal(view.pending, false);
	assert.equal(view.terminalResult, null);
	assert.equal(view.executionProof.accepted, false);
	assert.equal(view.executionProof.executed, false);
	assert.equal(view.executionProof.safeToRedispatch, false);
	assert.equal(view.transport.controlRequestId, null);
	assert.deepEqual(view.children, []);
});

test("unrecognized result types do not crash", () => {
	for (const value of [undefined, false, 0, "", []]) {
		const view = ResultView.inspect(value);
		assert.equal(view.terminal, false);
		assert.equal(view.pending, false);
	}
});

test("outer identity survives nested completion receipts", () => {
	const view = ResultView.inspect({
		action: "previewActionResult",
		controlRequestId: "outer-id",
		result: { state: "completed", controlRequestId: "inner-id", exitCode: 0 }
	});
	assert.equal(view.preserved.controlRequestId, "outer-id");
	assert.equal(view.terminal, true);
	assert.equal(view.terminalResult.exitCode, 0);
});

test("mixed child successes and failures retain identities", () => {
	const view = ResultView.inspect({
		results: [
			{ action: "read", ok: true, controlRequestId: "child-a" },
			{ action: "write", ok: false, error: "denied", requestKey: "child-b" }
		]
	});
	assert.equal(view.partialSuccess.succeeded.length, 1);
	assert.equal(view.partialSuccess.failed.length, 1);
	assert.equal(view.partialSuccess.failed[0].error, "denied");
	assert.equal(view.partialSuccess.failed[0].retry.requestKey, "child-b");
});
