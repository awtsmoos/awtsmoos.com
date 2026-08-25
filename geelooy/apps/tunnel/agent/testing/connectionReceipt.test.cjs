// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Verifies schema-six connection testimony across transport and runtime renewal.
 * @description
 * The Awtsmoos lets a socket be renewed without erasing the covenant beneath its breath;
 * Awtsmoos.com therefore keeps connection context stable through transport revision while
 * a true runtime activation receives a distinct runtime generation identity in the light.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-connection-receipt-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
process.env.AWTSMOOS_ACTIVATION_ID = "activation-one";
process.env.AWTSMOOS_RUNTIME_VERSION = "runtime-one";
const Receipt = require("../lib/runtime/connection-receipt.js");

try {
	const contract = {
		tunnelId: "tun_test_identity",
		tunnelName: "awt-test",
		agentVersion: "test-agent",
		releaseSourceSha: "release-one",
		actionManifestHash: "manifest-one",
		actionSchemaDigest: "schema-one",
		publicActionDigest: "public-one",
		publicActionCount: 14
	};
	const first = Receipt.write("registered", {
		...contract,
		generation: 2,
		reconnectAttempt: 0,
		lastServerMessageAt: new Date().toISOString()
	}, root);
	assert.equal(first.schemaVersion, 6);
	assert.equal(first.transportGeneration, 2);
	assert.equal(first.transportRevision, 2);
	assert.equal(first.connectionContextId.startsWith("ctx_"), true);
	assert.equal(first.connectionContextDigest.length, 64);
	assert.equal(first.connectionContract.releaseSourceSha, "release-one");
	assert.equal(first.publicActionCount, 14);
	const originalContext = first.connectionContextId;
	const originalRuntime = first.runtimeGenerationId;

	const reconnect = Receipt.write("reconnecting", {
		generation: 3,
		reconnectAttempt: 1,
		reconnectDelayMs: 1000
	}, root);
	assert.equal(reconnect.connectionContextId, originalContext);
	assert.equal(reconnect.runtimeGenerationId, originalRuntime);
	assert.equal(reconnect.transportGeneration, 3);
	assert.equal(reconnect.reconnectStreak, 1);
	assert.ok(reconnect.reconnectStreakStartedAt);

	process.env.AWTSMOOS_ACTIVATION_ID = "activation-two";
	const replaced = Receipt.write("registered", {
		...contract,
		generation: 1,
		lastServerMessageAt: new Date().toISOString()
	}, root);
	assert.equal(replaced.connectionContextId, originalContext);
	assert.notEqual(replaced.runtimeGenerationId, originalRuntime);
	assert.equal(replaced.reconnectStreakStartedAt, null);
	assert.equal(Receipt.matches(replaced, {
		tunnelId: "tun_test_identity",
		tunnelName: "awt-test",
		activationId: "activation-two",
		runtimeVersion: "runtime-one",
		maxAgeMs: 10000
	}), true);

	const legacy = Receipt.normalize({
		state: "registered",
		pid: process.pid,
		tunnelName: "legacy",
		generation: 7
	});
	assert.equal(legacy.schemaVersion, 6);
	assert.equal(legacy.ownerPid, process.pid);
	assert.equal(legacy.transportGeneration, 7);
	assert.equal(legacy.runtimeGenerationId, "");

	fs.writeFileSync(Receipt.receiptPath(root), "not-json");
	assert.equal(Receipt.read(root), null);
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-receipt-schema-six",
		stableContextAcrossTransport: true,
		runtimeReplacementDistinct: true
	}, null, 2));
} finally {
	delete process.env.AWTSMOOS_ACTIVATION_ID;
	delete process.env.AWTSMOOS_RUNTIME_VERSION;
	delete process.env.AWTSMOOS_INSTALL_ROOT;
	fs.rmSync(root, { recursive: true, force: true });
}
