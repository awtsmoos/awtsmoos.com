// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-identity-slots-"));
const installRoot = path.join(sandbox, "runtime");
const recoveryRoot = path.join(sandbox, "recovery");
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
process.env.AWTSMOOS_RECOVERY_ROOT = recoveryRoot;
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `slots-${process.pid}`;

const DeviceIdentity = require("../lib/deviceIdentity/index.js");
const SlotStore = require("../lib/deviceIdentity/identitySlotStore.js");

test("healthy identity survives full active forget through a verified standby slot", () => {
	const config = { installRoot };
	const keys = DeviceIdentity.KeyMaterial.ensure(config);
	DeviceIdentity.SecureStore.write(keys.metadata.deviceId, "credential", "credential-lkg");
	DeviceIdentity.Metadata.update(config, {
		tunnelId: "tun_lkg",
		pairedAt: new Date().toISOString(),
		credentialVersion: 7
	});
	const captured = DeviceIdentity.captureHealthyIdentity(config, {
		version: "9.9.9",
		pid: 1234
	});
	assert.equal(captured.state, "captured");
	assert.equal(SlotStore.read(config).runtimeVersion, "9.9.9");
	DeviceIdentity.forget(config);
	assert.equal(DeviceIdentity.load(config).ok, false);
	const restored = DeviceIdentity.restoreHealthyIdentity(config);
	assert.equal(restored.state, "restored");
	const loaded = DeviceIdentity.load(config);
	assert.equal(loaded.ok, true);
	assert.equal(loaded.tunnelId, "tun_lkg");
	assert.equal(loaded.deviceCredential, "credential-lkg");
	assert.equal(
		DeviceIdentity.KeyCoherence.inspect(
			DeviceIdentity.Metadata.read(config),
			DeviceIdentity.SecureStore.read(loaded.deviceId, "private-key")
		).ok,
		true
	);
});

test("a corrupted standby credential is rejected without changing active state", () => {
	const config = { installRoot };
	const slot = SlotStore.read(config);
	DeviceIdentity.forget(config);
	DeviceIdentity.SecureStore.write(
		slot.deviceId,
		DeviceIdentity.IdentitySlots.SLOT_CREDENTIAL,
		"tampered"
	);
	const restored = DeviceIdentity.restoreHealthyIdentity(config);
	assert.equal(restored.state, "slot_credential_invalid");
	assert.equal(restored.changed, false);
	assert.equal(DeviceIdentity.load(config).ok, false);
});

test.after(() => fs.rmSync(sandbox, { recursive: true, force: true }));
