// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const {
	verifyTunnelResponse,
	allowedActionAlias
} = require("../fsVessel/responseContract.js");

/**
 * @file Proves command correlation accepts only truthful worker promotion.
 * @description
 * The Awtsmoos preserves a shell request while Awtsmoos.com promotes execution
 * into a durable command worker; unrelated actions remain visible as mismatches.
 */
assert.equal(allowedActionAlias("shellCommand", "commandStart"), true);
assert.equal(allowedActionAlias("shellCommand", "commandRun"), true);
assert.equal(allowedActionAlias("shellCommand", "deleteFile"), false);
assert.equal(allowedActionAlias("commandStatus", "commandStart"), false);
assert.equal(allowedActionAlias("commandWait", "commandStatus"), true);
assert.equal(allowedActionAlias("commandJobWait", "commandWait"), true);
assert.equal(allowedActionAlias("commandPoll", "commandStatus"), true);

const promoted = verifyTunnelResponse({
	requestAction: "shellCommand",
	executionAction: "commandStart",
	actualAction: "commandStart",
	actionPromoted: true,
	controlRequestId: "ctl_shell",
	clientRequestId: "client_shell",
	nonce: "nonce_shell",
	jobId: "cmdjob_shell"
}, {
	action: "shellCommand",
	controlRequestId: "ctl_shell",
	clientRequestId: "client_shell",
	nonce: "nonce_shell"
}, "awt-test");
assert.notEqual(promoted.ok, false);

const mismatch = verifyTunnelResponse({
	requestAction: "commandStart",
	controlRequestId: "ctl_1",
	clientRequestId: "client_1",
	nonce: "nonce_1",
	jobId: "cmdjob_1"
}, {
	action: "commandStatus",
	controlRequestId: "ctl_1",
	clientRequestId: "client_1",
	nonce: "nonce_1",
	jobId: "cmdjob_1"
}, "awt-test");
assert.equal(mismatch.ok, false);
assert.equal(mismatch.error, "tunnel_response_correlation_mismatch");
assert.match(
	mismatch.mismatchProof.join("\n"),
	/requestAction expected commandStatus got commandStart/
);

const unrelated = verifyTunnelResponse({
	requestAction: "deleteFile",
	controlRequestId: "ctl_bad"
}, {
	action: "shellCommand",
	controlRequestId: "ctl_bad"
}, "awt-test");
assert.equal(unrelated.ok, false);

const waitOk = verifyTunnelResponse({
	requestAction: "commandStatus",
	controlRequestId: "ctl_2",
	clientRequestId: "client_2",
	nonce: "nonce_2",
	jobId: "cmdjob_2"
}, {
	action: "commandWait",
	controlRequestId: "ctl_2",
	clientRequestId: "client_2",
	nonce: "nonce_2",
	jobId: "cmdjob_2"
}, "awt-test");
assert.notEqual(waitOk.ok, false);

console.log(JSON.stringify({
	ok: true,
	suite: "response-contract-command-actions",
	shellPromotionAccepted: true,
	unrelatedActionRejected: true
}, null, 2));
