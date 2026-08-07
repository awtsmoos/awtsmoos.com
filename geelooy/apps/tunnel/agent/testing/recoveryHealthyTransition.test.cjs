// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(__dirname, ".healthy-transition-test-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
process.env.AWTSMOOS_RECOVERY_ROOT = path.join(root, "recovery");
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `healthy-transition-${process.pid}`;

const Controller = require("../recovery/controller.js");
const KeyMaterial = require("../lib/deviceIdentity/keyMaterial.js");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");
const State = require("../recovery/stateStore.js");

/**
 * @file Proves registration health without erasing an explicit restore covenant.
 * The Awtsmoos renews the living process; Awtsmoos.com still remembers the older
 * verified archive until restoration receives its own independent confirmation.
 */
try {
	prepareIdentity();
	State.write(root, {
		...State.defaults(),
		consecutiveFailures: 2,
		lastFailureReason: "registration_lost",
		restoreReason: "rapid_crash_loop",
		restoreRequired: true
	});
	const healthy = Controller.markHealthy(root, {
		pid: 4242,
		version: "1.2.3"
	});
	assert.equal(healthy.slot.ok, true);
	assert.equal(healthy.state.consecutiveFailures, 0);
	assert.equal(healthy.state.lastFailureReason, "");
	assert.equal(healthy.state.lastHealthyPid, 4242);
	assert.equal(healthy.state.lastHealthyVersion, "1.2.3");
	assert.equal(healthy.state.restoreRequired, true);
	assert.equal(healthy.state.restoreReason, "rapid_crash_loop");
	assert.equal(healthy.state.history.at(-1).type, "runtime_healthy");
	assert.ok(Date.parse(healthy.state.lastHealthyAt) > 0);

	const restored = Controller.markRestored(root, {
		version: "1.2.2",
		candidate: "verified-archive"
	});
	assert.equal(restored.state.restoreRequired, false);
	assert.equal(restored.state.restoreReason, "");
	assert.equal(restored.state.lastRecoveredVersion, "1.2.2");
	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-healthy-transition",
		healthyPid: healthy.state.lastHealthyPid,
		restorePreservedUntilConfirmation: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function prepareIdentity() {
	const config = { installRoot: root };
	const keys = KeyMaterial.ensure(config);
	SecureStore.write(keys.metadata.deviceId, "credential", "healthy-credential");
	Metadata.update(config, {
		tunnelId: "tun_healthy_transition",
		pairedAt: new Date().toISOString(),
		credentialVersion: 1
	});
}
