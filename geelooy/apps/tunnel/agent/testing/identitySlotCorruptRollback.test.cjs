// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const sandbox = fs.mkdtempSync(path.join(__dirname, ".slot-corrupt-rollback-"));
process.env.AWTSMOOS_INSTALL_ROOT = sandbox;
process.env.AWTSMOOS_RECOVERY_ROOT = path.join(sandbox, "recovery");
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `slot-corrupt-rollback-${process.pid}`;

const KeyMaterial = require("../lib/deviceIdentity/keyMaterial.js");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");
const Slots = require("../lib/deviceIdentity/identitySlots.js");
const Store = require("../lib/deviceIdentity/identitySlotStore.js");
const Verification = require("../lib/deviceIdentity/identitySlotVerification.js");

test("failed promotion never resurrects an already corrupted standby", () => {
	const config = { installRoot: sandbox };
	const keys = KeyMaterial.ensure(config);
	SecureStore.write(keys.metadata.deviceId, "credential", "credential-old");
	Metadata.update(config, {
		tunnelId: "tun_corrupt_rollback",
		pairedAt: new Date().toISOString(),
		credentialVersion: 1
	});
	assert.equal(Slots.capture(config).ok, true);
	const slot = Store.read(config);
	SecureStore.write(slot.deviceId, Slots.SLOT_CREDENTIAL, "corrupted-standby");
	SecureStore.write(slot.deviceId, "credential", "credential-new");
	Metadata.update(config, { credentialVersion: 2 });
	const originalVerify = Verification.verify;
	Verification.verify = () => ({ ok: false, code: "forced_new_generation_failure" });
	try {
		const result = Slots.capture(config);
		assert.equal(result.ok, false);
		assert.equal(result.rollback.ok, true);
		assert.equal(result.rollback.restoredPrevious, false);
		assert.equal(Store.read(config), null);
		assert.equal(SecureStore.read(slot.deviceId, Slots.SLOT_PRIVATE_KEY), null);
		assert.equal(SecureStore.read(slot.deviceId, Slots.SLOT_CREDENTIAL), null);
	} finally {
		Verification.verify = originalVerify;
	}
});

test.after(() => fs.rmSync(sandbox, { recursive: true, force: true }));
