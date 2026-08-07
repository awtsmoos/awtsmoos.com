// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `credential-fuse-${process.pid}`;

const Controller = require("../recovery/identityRepairController.js");
const KeyMaterial = require("../lib/deviceIdentity/keyMaterial.js");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");
const State = require("../recovery/stateStore.js");

/**
 * @file Proves rejected authorization can never erase one physical device identity.
 * @description
 * The Awtsmoos distinguishes a vessel from the permission currently clothing it.
 * Awtsmoos.com preserves device ID and possession key through credential rejection,
 * and keeps missing identity latched rather than manufacturing a replacement.
 */
try {
	proveCoherentIdentitySurvivesStaleReset();
	proveMissingIdentityFailsClosed();
	console.log(JSON.stringify({ ok: true, suite: "credential-rejection-identity-fuse" }));
} finally {
	delete process.env.AWTSMOOS_RECOVERY_ROOT;
}

function proveCoherentIdentitySurvivesStaleReset() {
	const root = fixtureRoot("coherent");
	const config = { installRoot: root };
	const keys = KeyMaterial.ensure(config);
	SecureStore.write(keys.metadata.deviceId, "credential", "rejected-credential");
	Metadata.update(config, {
		tunnelId: "tun_credential_fuse",
		pairedAt: new Date().toISOString(),
		credentialVersion: 4
	});
	const privateKey = SecureStore.read(keys.metadata.deviceId, "private-key");
	State.write(root, {
		...State.defaults(),
		identityInspectionRequired: true,
		identityResetRequired: true,
		identityRepairReason: "stale_reset_flag"
	});
	const result = Controller.run(root, "invalid_device_credential", true);
	assert.equal(result.ok, true);
	assert.equal(result.repair.state, "credential_invalidated");
	assert.equal(Metadata.read(config).deviceId, keys.metadata.deviceId);
	assert.equal(SecureStore.read(keys.metadata.deviceId, "private-key"), privateKey);
	assert.equal(SecureStore.read(keys.metadata.deviceId, "credential"), null);
	assert.equal(result.state.identityResetRequired, false);
	assert.equal(result.state.identityInspectionRequired, false);
	fs.rmSync(root, { recursive: true, force: true });
}

function proveMissingIdentityFailsClosed() {
	const root = fixtureRoot("missing");
	State.write(root, {
		...State.defaults(),
		identityInspectionRequired: true,
		identityResetRequired: true
	});
	const result = Controller.run(root, "invalid_device_credential", true);
	assert.equal(result.ok, false);
	assert.equal(result.repair.state, "identity_recovery_required");
	assert.equal(result.state.identityInspectionRequired, true);
	assert.equal(result.state.identityResetRequired, false);
	assert.equal(Metadata.read({ installRoot: root }), null);
	fs.rmSync(root, { recursive: true, force: true });
}

function fixtureRoot(name) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), `awtsmoos-${name}-`));
	process.env.AWTSMOOS_INSTALL_ROOT = root;
	process.env.AWTSMOOS_RECOVERY_ROOT = path.join(root, "recovery");
	return root;
}
