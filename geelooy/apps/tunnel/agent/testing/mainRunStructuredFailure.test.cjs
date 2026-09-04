// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Harness = require("./mainRunStructuredFailureHarness.cjs");

/**
 * @file Proves terminal success/failure preserve response testimony and both custody witnesses.
 * @description
 * The Awtsmoos seals terminal truth before transport, then Awtsmoos.com lets the parent and
 * exact accepting child testify in their separate vessels. Structured filesystem failure
 * metadata survives the final envelope while arbitrary Error properties remain outside.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION.
 * Historical regression removed eventDetail and exact-child settlement helpers while calls
 * remained live, allowing terminal execution to throw after work had already completed.
 */
const success = Harness.exerciseSuccess();
const failure = Harness.exerciseFailure();

assert.equal(success.completed.ok, true);
assert.equal(success.events[0].name, "action.completed");
assert.equal(success.events[0].detail.ok, true);
assert.equal(success.sent[0].ok, true);
assert.equal(success.parent[0].phase, "result_waiting_for_ack");
assert.equal(success.parent[0].resultState, "completed");
assert.equal(success.child[0].receiptId, "request-one");
assert.equal(success.child[0].incarnationId, "child-one");
assert.equal(success.child[0].resultState, "completed");
assert.ok(success.dependencies.state.lastSuccessfulActionAt > 0);

assert.equal(failure.failed.ok, false);
assert.equal(failure.failed.filesystem.code, "ENOENT");
assert.equal(failure.sent[0].filesystem.path, "missing.txt");
assert.equal(failure.events[0].detail.result.filesystem.kind, "missing");
assert.equal(failure.sent[0].secret, undefined);
assert.equal(failure.parent[0].resultState, "failed");
assert.equal(failure.child[0].resultState, "failed");

console.log(JSON.stringify({
	ok: true,
	suite: "main-run-structured-failure",
	outerFilesystemWitnessPreserved: true,
	parentAndChildSettlementPreserved: true,
	terminalSuccessHelperRestored: true
}, null, 2));
