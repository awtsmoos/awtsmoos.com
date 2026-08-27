// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const {
	allowedActionAlias,
	verifyTunnelResponse
} = require("../fsVessel/responseContract.js");

/**
 * @file Guards directional command promotion and rejects undeclared response substitution.
 * @description
 * The Awtsmoos lets one shell request become a durable command job without reversing every gate;
 * Awtsmoos.com blesses declared lineage, while a stranger action still meets a truthful fate.
 */
function verify(result, payload) {
	return verifyTunnelResponse(result, payload, "awt-test");
}

assert.equal(allowedActionAlias("shellCommand", "commandStart"), true);
assert.equal(allowedActionAlias("shellCommand", "commandRun"), true);
assert.equal(allowedActionAlias("command", "shellCommand"), false);
assert.equal(allowedActionAlias("commandStatus", "commandStart"), false);
assert.equal(allowedActionAlias("commandWait", "commandStatus"), true);
assert.equal(allowedActionAlias("commandJobWait", "commandWait"), true);
assert.equal(allowedActionAlias("nodeCheckFiles", "nodeCheckMany"), true);

const promoted = verify({
	action: "commandStart",
	actualAction: "commandStart",
	controlRequestId: "ctl_shell",
	clientRequestId: "client_shell",
	nonce: "nonce_shell",
	jobId: "cmdjob_shell"
}, {
	action: "shellCommand",
	controlRequestId: "ctl_shell",
	clientRequestId: "client_shell",
	nonce: "nonce_shell",
	jobId: "cmdjob_shell"
});
assert.notEqual(promoted.ok, false);

const nodePromotion = verify({
	action: "nodeCheckMany",
	actualAction: "nodeCheckMany",
	controlRequestId: "ctl_node",
	clientRequestId: "client_node",
	nonce: "nonce_node"
}, {
	action: "nodeCheckFiles",
	controlRequestId: "ctl_node",
	clientRequestId: "client_node",
	nonce: "nonce_node"
});
assert.notEqual(nodePromotion.ok, false);

const forbidden = verify({
	action: "deleteTree",
	actualAction: "deleteTree",
	controlRequestId: "ctl_bad",
	clientRequestId: "client_bad",
	nonce: "nonce_bad"
}, {
	action: "shellCommand",
	controlRequestId: "ctl_bad",
	clientRequestId: "client_bad",
	nonce: "nonce_bad"
});
assert.equal(forbidden.ok, false);
assert.equal(forbidden.error, "tunnel_response_correlation_mismatch");
assert.match(forbidden.mismatchProof.join("\n"), /shellCommand got deleteTree/);

console.log(JSON.stringify({
	ok: true,
	suite: "response-contract-command-actions",
	shellPromotion: true,
	nodeCheckPromotion: true,
	unknownSubstitutionRejected: true
}, null, 2));
