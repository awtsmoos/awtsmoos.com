// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Command = require("../tools/command/index.js");
const Identity = require("../lib/runtime/action-identity.js");
const ResponseV8 = require("../lib/runtime/response-v8.js");
const RelayIdentity = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/responseIdentity.js");

/**
	* @file Proves command promotion keeps caller and worker identity truthful.
	* @description
	* The Awtsmoos reveals one requested doorway and one execution vessel.
	* Awtsmoos.com permits their known alias relationship without contradiction.
	*/
const promoted = Command.preserveAliasIdentity({
	ok: true,
	action: "commandStart",
	executionAction: "commandStart",
	actualAction: "commandStart",
	jobId: "cmdjob_identity_test"
}, "commandRun", "commandRun");

assert.equal(promoted.action, "commandRun");
assert.equal(promoted.requestAction, "commandRun");
assert.equal(promoted.executionAction, "commandStart");
assert.equal(promoted.actualAction, "commandStart");
assert.equal(promoted.canonicalAction, "commandRun");
assert.equal(promoted.actionPromoted, true);
assert.equal(promoted.actionMismatch, false);
assert.equal(RelayIdentity.actualActionOf(promoted), "commandStart");

const compact = ResponseV8.compactTrust(promoted, {});
assert.equal(compact.action, "commandRun");
assert.equal(compact.requestAction, "commandRun");
assert.equal(compact.executionAction, "commandStart");
assert.equal(compact.actualAction, "commandStart");
assert.equal(compact.actionPromoted, true);
assert.equal(compact.actionMismatch, false);

const forbidden = Identity.decorate({}, "read", "deleteFile");
assert.equal(forbidden.actionMismatch, true);

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-action-identity-determinism",
	truthfulPromotion: true,
	allowedAliasNotMismatch: true,
	forbiddenMismatchDetected: true
}, null, 2));
