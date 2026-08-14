// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const sandbox = fs.mkdtempSync(path.join(__dirname, ".identity-slots-test-"));
process.env.AWTSMOOS_INSTALL_ROOT = sandbox;
process.env.AWTSMOOS_RECOVERY_ROOT = path.join(sandbox, "recovery");
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `slots-${process.pid}`;

const Forget = require("../lib/deviceIdentity/forget.js");
const KeyMaterial = require("../lib/deviceIdentity/keyMaterial.js");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");
const Slots = require("../lib/deviceIdentity/identitySlots.js");
const SlotStore = require("../lib/deviceIdentity/identitySlotStore.js");
const Verification = require("../lib/deviceIdentity/identitySlotVerification.js");

test("verified standby survives complete active forget", () => {
	const config = pairedConfig("happy", "credential-lkg");
	const captured = Slots.capture(config, { version: "9.9.9", pid: 1234 });
	assert.equal(captured.ok, true);
	assert.equal(SlotStore.read(config).runtimeVersion, "9.9.9");
	Forget.forget(config);
	assert.equal(Slots.restore(config).state, "restored");
	const metadata = Metadata.read(config);
	assert.equal(SecureStore.read(metadata.deviceId, "credential"), "credential-lkg");
});

test("repeated capture of one verified generation is idempotent", () => {
	const config = pairedConfig("idempotent", "credential-same");
	assert.equal(Slots.capture(config).state, "captured");
	const testimony = SlotStore.read(config);
	const repeated = Slots.capture(config);
	assert.equal(repeated.ok, true);
	assert.equal(repeated.state, "already_captured");
	assert.equal(repeated.changed, false);
	assert.deepEqual(SlotStore.read(config), testimony);
	Forget.forget(config);
});

test("corrupted standby credential is rejected", () => {
	const config = pairedConfig("corrupt", "credential-good");
	Slots.capture(config);
	const slot = SlotStore.read(config);
	Forget.forget(config);
	SecureStore.write(slot.deviceId, Slots.SLOT_CREDENTIAL, "tampered");
	assert.equal(Slots.restore(config).state, "slot_credential_invalid");
});

test("failed promotion rolls back the former proven generation", () => {
	const config = pairedConfig("rollback", "credential-old");
	Slots.capture(config);
	const former = SlotStore.read(config);
	const originalVerify = Verification.verify;
	SecureStore.write(former.deviceId, "credential", "credential-new");
	Verification.verify = () => ({ ok: false, code: "forced_readback_failure" });
	try {
		const result = Slots.capture(config);
		assert.equal(result.ok, false);
		assert.equal(result.rollback.ok, true);
		assert.equal(result.rollback.restoredPrevious, true);
		assert.deepEqual(SlotStore.read(config), former);
		assert.equal(
			SecureStore.read(former.deviceId, Slots.SLOT_CREDENTIAL),
			"credential-old"
		);
	} finally {
		Verification.verify = originalVerify;
	}
});

function pairedConfig(name, credential) {
	const config = { installRoot: path.join(sandbox, name) };
	process.env.AWTSMOOS_INSTALL_ROOT = config.installRoot;
	process.env.AWTSMOOS_RECOVERY_ROOT = path.join(config.installRoot, "recovery");
	const keys = KeyMaterial.ensure(config);
	SecureStore.write(keys.metadata.deviceId, "credential", credential);
	Metadata.update(config, {
		tunnelId: `tun_${name}`,
		pairedAt: new Date().toISOString(),
		credentialVersion: 1
	});
	return config;
}

test.after(() => fs.rmSync(sandbox, { recursive: true, force: true }));
