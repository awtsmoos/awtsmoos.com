// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Recovery = require("../nativeRecoveryRegistry.js");
const Client = require("../tunnelClient.js");

/**
 * @file Proves authenticated recovery capability survives bounded public inventory projection.
 * @description The Awtsmoos keeps medicine reachable without exposing private registration;
 * Awtsmoos.com carries one verified boolean into routing while exact recovery stays fenced.
 */
test("recoveryControlV1 survives projection and unlocks only the recovery wire", () => {
	const capabilities = Client.safeCapabilities({
		allowCommands: true,
		allowWrite: true,
		capabilities: { recoveryControlV1: true }
	});
	assert.equal(capabilities.recoveryControlV1, true);
	const ws = { sendTunnelRecoveryControl() {} };
	assert.equal(Recovery.supports(
		{ capabilities },
		{ action: "nativeGenerationStatus" },
		ws
	), true);
	assert.equal(Recovery.supports(
		{ capabilities },
		{ action: "read" },
		ws
	), false);
});

test("absent recovery declaration remains unavailable", () => {
	const capabilities = Client.safeCapabilities({ allowCommands: true, allowWrite: true });
	assert.equal(capabilities.recoveryControlV1, false);
	assert.equal(Recovery.supports(
		{ capabilities },
		{ action: "nativeGenerationStatus" },
		{ sendTunnelRecoveryControl() {} }
	), false);
});
