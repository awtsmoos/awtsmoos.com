// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Context = require("../lib/runtime/connection-context-state.js");

/**
 * @file Proves stable covenant identity is independent of transport and child-process breath.
 * @description
 * The Awtsmoos remains beyond every changing keli; Awtsmoos.com hashes release and action
 * truth into one connection context while runtime incarnation depends only on activation,
 * runtime version, and owning parent—not on a socket or connection-child moment in motion.
 */
test("connection context ignores transport revision", () => {
	const contract = {
		tunnelName: "awt-one",
		agentVersion: "agent-one",
		releaseSourceSha: "release-one",
		actionManifestHash: "manifest-one",
		actionSchemaDigest: "schema-one",
		publicActionDigest: "public-one",
		publicActionCount: 14
	};
	const first = Context.connectionContext({ ...contract, transportGeneration: 1 });
	const second = Context.connectionContext({ ...contract, transportGeneration: 900 });
	assert.equal(first.connectionContextId, second.connectionContextId);
	assert.equal(first.connectionContextDigest, second.connectionContextDigest);
});

test("runtime generation changes only with true runtime identity", () => {
	const first = Context.runtimeGenerationId({
		activationId: "activation-one",
		runtimeVersion: "runtime-one",
		ownerPid: 100,
		connectionPid: 200
	});
	const childRestart = Context.runtimeGenerationId({
		activationId: "activation-one",
		runtimeVersion: "runtime-one",
		ownerPid: 100,
		connectionPid: 999
	});
	const replacement = Context.runtimeGenerationId({
		activationId: "activation-two",
		runtimeVersion: "runtime-one",
		ownerPid: 101,
		connectionPid: 200
	});
	assert.equal(first, childRestart);
	assert.notEqual(first, replacement);
});
