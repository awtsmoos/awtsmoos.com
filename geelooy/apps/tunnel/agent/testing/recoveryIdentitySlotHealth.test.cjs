// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const sandbox = fs.mkdtempSync(path.join(__dirname, ".identity-health-test-"));
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `slot-health-${process.pid}`;

const Controller = require("../recovery/controller.js");
const KeyMaterial = require("../lib/deviceIdentity/keyMaterial.js");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");

test("registered runtime clears stale health when standby capture later fails", () => {
	const root = pairedRoot("degraded");
	const first = Controller.markHealthy(root, { version: "1.0.test", pid: 110 });
	assert.equal(first.state.tier, 5);
	assert.ok(first.state.lastHealthyAt);
	const metadata = Metadata.read({ installRoot: root });
	SecureStore.write(metadata.deviceId, "private-key", "not-a-private-key");
	const decision = Controller.markHealthy(root, { version: "1.0.test", pid: 111 });
	assert.equal(decision.ok, true);
	assert.equal(decision.slot.ok, false);
	assert.equal(decision.state.tier, 4);
	assert.equal(decision.state.identityInspectionRequired, true);
	assert.equal(decision.state.identityResetRequired, false);
	assert.equal(decision.state.lastHealthyAt, null);
	assert.ok(decision.state.lastOnlineAt);
});

test("coherent standby capture is required for tier five", () => {
	const root = pairedRoot("healthy");
	const decision = Controller.markHealthy(root, { version: "1.0.test", pid: 222 });
	assert.equal(decision.ok, true);
	assert.equal(decision.slot.ok, true);
	assert.equal(decision.state.tier, 5);
	assert.equal(decision.state.identityInspectionRequired, false);
	assert.ok(decision.state.lastHealthyAt);
});

function pairedRoot(name) {
	const root = path.join(sandbox, name);
	process.env.AWTSMOOS_INSTALL_ROOT = root;
	process.env.AWTSMOOS_RECOVERY_ROOT = path.join(root, "recovery");
	const config = { installRoot: root };
	const keys = KeyMaterial.ensure(config);
	SecureStore.write(keys.metadata.deviceId, "credential", `credential-${name}`);
	Metadata.update(config, {
		tunnelId: `tun_${name}`,
		pairedAt: new Date().toISOString(),
		credentialVersion: 1
	});
	return root;
}

test.after(() => fs.rmSync(sandbox, { recursive: true, force: true }));
