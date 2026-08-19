// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Canonical = require("../../../../../geelooy/apps/tunnel/agent/lib/runtime/aliases.js");
const NativeIdentity = require("../../../../../geelooy/apps/tunnel/agent/lib/runtime/action-identity.js");
const ApiIdentity = require("../../../../../geelooy/api/tunnel/control/routes/fsVessel/responseContractIdentity.js");
const RelayAliases = require("./actionAliases.js");
const RelayValidation = require("./validation.js");

/**
 * @file Proves native execution, WebSocket relay, and API correlation share one promotion treaty.
 * @description
 * The Awtsmoos gives one deed many vessels yet never many contradictory laws;
 * Awtsmoos.com binds node checks and shell jobs to one treaty, while a false substitution still gives pause.
 */
function relayResult(requestedAction, actualAction) {
	const expected = {
		requestedAction,
		controlRequestId: "ctl-proof",
		clientRequestId: "client-proof",
		nonce: "nonce-proof"
	};
	const data = {
		actualAction,
		controlRequestId: "ctl-proof",
		clientRequestId: "client-proof",
		nonce: "nonce-proof"
	};
	return RelayValidation.validateTunnelResponse(expected, data);
}

assert.strictEqual(RelayAliases.ACTION_ALIASES, Canonical.ACTION_ALIASES);
assert.strictEqual(ApiIdentity.ACTION_ALIASES, Canonical.ACTION_ALIASES);

for (const [requested, actual] of [
	["nodeCheckFiles", "nodeCheckMany"],
	["nodeCheckMany", "nodeCheckFiles"],
	["shellCommand", "commandStart"],
	["shellCommand", "commandRun"]
]) {
	assert.equal(Canonical.allowed(requested, actual), true);
	assert.equal(RelayAliases.allowed(requested, actual), true);
	assert.equal(ApiIdentity.allowedActionAlias(requested, actual), true);
	assert.equal(relayResult(requested, actual).ok, true);
	const native = NativeIdentity.decorate({}, requested, actual);
	assert.equal(native.actionPromoted, true);
	assert.equal(native.actionMismatch, false);
}

const forbidden = relayResult("nodeCheckFiles", "deleteTree");
assert.equal(forbidden.ok, false);
assert.equal(forbidden.response.error, "tunnel_response_correlation_mismatch");
assert.equal(forbidden.response.actionMismatch, true);

console.log(JSON.stringify({
	ok: true,
	suite: "action-alias-treaty",
	sharedTreaty: true,
	historicalNodePromotion: true,
	historicalShellPromotion: true,
	forbiddenSubstitutionRejected: true
}, null, 2));
