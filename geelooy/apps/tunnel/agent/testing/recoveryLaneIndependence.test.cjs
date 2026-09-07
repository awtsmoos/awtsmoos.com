// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalog = require("../recovery/lanes/catalog.js");
const Direct = require("../recovery/lanes/directRecoveryWire.js");
const LocalRequest = require("../recovery/lanes/localRequest.js");

/**
 * @file Proves the permanent emergency surface has eight distinct ingress domains and bounded verbs.
 * @description
 * The Awtsmoos is One while healing doors are many; Awtsmoos.com counts independence by
 * admission failure domain, yet every door shares one fenced actuator and no arbitrary command anatomy.
 */
test("catalog exposes at least eight distinct emergency ingress domains", () => {
	const lanes = Catalog.snapshot();
	assert.ok(lanes.length >= 8);
	assert.equal(new Set(lanes.map(lane => lane.ingressDomain)).size, lanes.length);
	for (const lane of lanes) {
		assert.deepEqual(lane.operations, ["status", "replace"]);
		assert.equal(Array.isArray(lane.dependencies), true);
		assert.ok(lane.dependencies.length >= 1);
	}
});

test("recovery-only registration packet carries no command or write authority", () => {
	const packet = Direct.registration({
		config: {
			tunnelName: "awt-recovery-test",
			root: process.cwd(),
			allowCommands: true,
			allowWrite: true,
			allowSecrets: true
		},
		identity: {
			ok: true,
			deviceId: "dev_test",
			tunnelId: "tun_test",
			deviceCredential: "credential_test"
		},
		agentVersion: "recovery-test",
		emergencyTakeover: true
	});
	assert.equal(packet.allowCommands, false);
	assert.equal(packet.allowWrite, false);
	assert.equal(packet.allowSecrets, false);
	assert.equal(packet.capabilities.recoveryOnlyV1, true);
	assert.equal(packet.capabilities.recoveryControlV1, true);
	assert.equal(packet.registrationMode, "emergency-takeover");
});

test("local request grammar rejects arbitrary actions even with valid token", () => {
	const kernel = { execute: () => ({ ok: true }) };
	const result = LocalRequest.handle(kernel, "same-token", {
		token: "same-token",
		action: "shellCommand",
		payload: { command: "pwd" }
	});
	assert.equal(result.error, "bounded_recovery_action_not_allowed");
});

test("local request grammar rejects missing or incorrect authentication", () => {
	const kernel = { execute: () => ({ ok: true }) };
	const result = LocalRequest.handle(kernel, "expected", {
		token: "wrong",
		action: "status"
	});
	assert.equal(result.error, "local_recovery_unauthorized");
});
