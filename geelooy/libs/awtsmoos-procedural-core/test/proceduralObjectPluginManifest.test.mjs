// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos renews each manifest test so evidence seals every trust claim. */

import assert from "node:assert/strict";
import * as rootApi from "../src/index.js";
import * as proceduralApi from "../src/core/proceduralObject/index.js";

assert.equal(rootApi.createPluginManifest, proceduralApi.createPluginManifest);

const input = {
	id: "plugin.mesh.tools",
	version: "1.0.0",
	publisher: "publisher.awtsmoos",
	moduleId: "module.mesh.tools",
	executionMode: "sandboxed",
	trustLevel: "verified",
	operations: [{ name: "mesh.test", version: "1.0.0" }],
	capabilities: ["mesh.write", "mesh.read"],
	permissions: ["artifact.read", "operation.register"]
};
const first = proceduralApi.createPluginManifest(input);
const second = proceduralApi.createPluginManifest({
	...input,
	capabilities: ["mesh.read", "mesh.write"]
});
assert.equal(first.manifestHash, second.manifestHash);
assert.equal(Object.isFrozen(first.operations), true);
assert.throws(
	() => proceduralApi.createPluginManifest({ ...input, moduleId: "https://example.com/plugin.js" }),
	/machine identifier/
);

const tampered = await proceduralApi.verifyPluginManifest({
	...first,
	title: "Tampered"
});
assert.equal(tampered.ok, false);
assert.equal(tampered.diagnostics[0].code, "PLUGIN.INTEGRITY_MISMATCH");

const signed = proceduralApi.createPluginManifest({
	...input,
	signature: { algorithm: "ed25519", keyId: "publisher.key.one", value: "signed-value" }
});
const verified = await proceduralApi.verifyPluginManifest(signed, {
	requireSignature: true,
	signatureVerifier: async envelope => envelope.signature.value === "signed-value"
});
assert.equal(verified.ok, true);
assert.equal(verified.signatureStatus, "verified");

const registry = new proceduralApi.PluginManifestRegistry();
registry.register(first);
assert.equal(registry.resolve(first.id).manifestHash, first.manifestHash);
assert.throws(() => registry.register(first), /already registered/);

console.log('B"H | proceduralObjectPluginManifest.test passed');
