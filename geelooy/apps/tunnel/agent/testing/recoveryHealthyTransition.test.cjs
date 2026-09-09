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
 * @file Proves healthy registration preserves real rollback covenants but releases obsolete transport latches.
 * @description
 * The Awtsmoos distinguishes a repaired road from a deliberately requested archive return.
 * Awtsmoos.com clears stale DNS/transport restore state only after full identity-slot health,
 * while rapid-crash restoration remains latched until an independent restore confirmation.
 */
try {
	prepareIdentity();
	proveSoftwareRestoreSurvives();
	proveDnsRestoreReconciles();
	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-healthy-transition",
		softwareRestorePreserved: true,
		transientDnsLatchReconciled: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

/** Keeps explicit software/crash restoration latched through a healthy registration. */
function proveSoftwareRestoreSurvives() {
	State.write(root, {
		...State.defaults(),
		restoreReason: "rapid_crash_loop",
		restoreRequired: true
	});
	const healthy = Controller.markHealthy(root, { pid: 4242, version: "1.2.3" });
	assert.equal(healthy.slot.ok, true);
	assert.equal(healthy.state.restoreRequired, true);
	assert.equal(healthy.state.restoreReason, "rapid_crash_loop");
	assert.equal(healthy.state.lastHealthyPid, 4242);
	const restored = Controller.markRestored(root, {
		version: "1.2.2",
		candidate: "verified-archive"
	});
	assert.equal(restored.state.restoreRequired, false);
	assert.equal(restored.state.restoreReason, "");
}

/** Clears an old restore latch that originated only from a DNS transport outage. */
function proveDnsRestoreReconciles() {
	State.write(root, {
		...State.defaults(),
		restoreReason: "registration_getaddrinfo_enotfound_awtsmoos.com",
		restoreRequired: true
	});
	const healthy = Controller.markHealthy(root, { pid: 4343, version: "1.2.3" });
	assert.equal(healthy.slot.ok, true);
	assert.equal(healthy.state.restoreRequired, false);
	assert.equal(healthy.state.restoreReason, "");
	assert.equal(healthy.state.lastHealthyPid, 4343);
}

/** Seeds one coherent hermetic test identity so health transitions can capture a standby witness. */
function prepareIdentity() {
	const config = { installRoot: root };
	const keys = KeyMaterial.ensure(config);
	SecureStore.write(keys.metadata.deviceId, "credential", "healthy-credential");
	Metadata.update(config, {
		tunnelId: "tun_test_healthy_transition",
		pairedAt: new Date().toISOString(),
		credentialVersion: 1
	});
}
