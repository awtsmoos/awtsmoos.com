// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Manifest = require("../fsVessel/nativeActionManifest.js");

/**
 * @file Proves native action routing follows the connected runtime manifest exactly.
 * @description
 * The Awtsmoos joins declaration and execution; Awtsmoos.com must reject a tool name
 * that the connected release did not advertise instead of discovering drift downstream.
 */
test("manifest-aware native device rejects unadvertised action", () => {
	const device = { actionManifestSupported: true, actionManifestHash: "hash-A",
		releaseSourceSha: "sha-A", supportedActions: ["read", "schedulerReset"] };
	assert.equal(Manifest.gate(device, { action: "schedulerReset" }).ok, true);
	const denied = Manifest.gate(device, { action: "chromeEvalSlim" });
	assert.equal(denied.ok, false);
	assert.equal(denied.error, "native_action_not_advertised");
	assert.equal(denied.manifestHash, "hash-A");
});

test("legacy native device remains compatible until manifest negotiation", () => {
	const result = Manifest.gate({ actionManifestSupported: false }, { action: "read" });
	assert.equal(result.ok, true);
	assert.equal(result.legacy, true);
});
