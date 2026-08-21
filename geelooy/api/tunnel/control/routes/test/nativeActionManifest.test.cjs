// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Manifest = require("../fsVessel/nativeActionManifest.js");

/**
 * @file Proves native admission gates exact inner operations while public names stay compact.
 * @description
 * The Awtsmoos joins declaration and execution beneath the outward veil; Awtsmoos.com
 * accepts only deeds in the grouped manifest and keeps older flat registrations compatible.
 */
test("grouped internal manifest gates exact resolved action", () => {
	const client = {
		actionManifestHash: "hash-A",
		releaseSourceSha: "sha-A",
		supportedActions: ["files", "status", "recover"],
		actionManifest: {
			fs: ["read", "schedulerReset"],
			command: ["commandRun"]
		}
	};
	assert.equal(Manifest.gate(client, { action: "schedulerReset" }).ok, true);
	assert.equal(Manifest.gate(client, { action: "commandRun" }).ok, true);
	const denied = Manifest.gate(client, { action: "chromeEvalSlim" });
	assert.equal(denied.ok, false);
	assert.equal(denied.error, "native_action_not_advertised");
	assert.equal(Manifest.publicFields(client).supportedActions.length, 3);
	assert.equal(Manifest.internalActions(client).length, 3);
});

test("legacy flat native registration remains compatible", () => {
	const flat = {
		actionManifestHash: "hash-B",
		supportedActions: ["read", "schedulerReset"]
	};
	assert.equal(Manifest.gate(flat, { action: "read" }).ok, true);
	assert.equal(Manifest.gate(flat, { action: "write" }).ok, false);
	const noManifest = Manifest.gate({}, { action: "read" });
	assert.equal(noManifest.ok, true);
	assert.equal(noManifest.legacy, true);
});
