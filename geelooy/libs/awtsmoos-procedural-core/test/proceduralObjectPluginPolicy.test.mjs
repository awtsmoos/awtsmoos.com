// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos permits no unnamed authority; these tests prove default denial. */

import assert from "node:assert/strict";
import {
	createPluginManifest,
	evaluatePluginPermissions,
	verifyPluginManifest
} from "../src/core/proceduralObject/index.js";

const manifest = createPluginManifest({
	id: "plugin.policy.test",
	version: "1.0.0",
	publisher: "publisher.awtsmoos",
	moduleId: "module.policy.test",
	executionMode: "sandboxed",
	trustLevel: "verified",
	permissions: ["artifact.read", "operation.register"]
});

const denied = evaluatePluginPermissions(manifest, {
	grantedPermissions: ["artifact.read"],
	minimumTrustLevel: "verified",
	allowedExecutionModes: ["sandboxed"]
});
assert.equal(denied.ok, false);
assert.deepEqual(denied.denied, ["operation.register"]);
assert.equal(denied.diagnostics[0].code, "PLUGIN.PERMISSION_DENIED");

const allowed = evaluatePluginPermissions(manifest, {
	grantedPermissions: ["operation.register", "artifact.read"],
	minimumTrustLevel: "verified",
	allowedExecutionModes: ["sandboxed"]
});
assert.equal(allowed.ok, true);
assert.deepEqual(allowed.granted, ["artifact.read", "operation.register"]);

const insufficient = evaluatePluginPermissions(manifest, {
	grantedPermissions: manifest.permissions,
	minimumTrustLevel: "trusted"
});
assert.equal(insufficient.trustAccepted, false);

const unsigned = await verifyPluginManifest(manifest, { requireSignature: true });
assert.equal(unsigned.ok, false);
assert.equal(unsigned.signatureStatus, "unsigned");
assert.equal(unsigned.diagnostics.at(-1).code, "PLUGIN.SIGNATURE_REQUIRED");

console.log('B"H | proceduralObjectPluginPolicy.test passed');
