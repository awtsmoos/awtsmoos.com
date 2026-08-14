// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const sandbox = fs.mkdtempSync(path.join(__dirname, ".pairing-slot-test-"));
process.env.AWTSMOOS_INSTALL_ROOT = sandbox;
process.env.AWTSMOOS_RECOVERY_ROOT = path.join(sandbox, "recovery");
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `pair-slot-${process.pid}`;

const Commit = require("../lib/deviceIdentity/pairingCommit.js");
const Forget = require("../lib/deviceIdentity/forget.js");
const KeyMaterial = require("../lib/deviceIdentity/keyMaterial.js");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");
const Slots = require("../lib/deviceIdentity/identitySlots.js");
const Store = require("../lib/deviceIdentity/identitySlotStore.js");

test("pairing commit immediately seals the approved identity generation", () => {
	const config = { installRoot: path.join(sandbox, "runtime") };
	const keys = KeyMaterial.ensure(config);
	const credential = "approved-credential";
	const credentialEnvelope = crypto.publicEncrypt({
		key: keys.publicKey,
		oaepHash: "sha256",
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
	}, Buffer.from(credential, "utf8")).toString("base64");
	const result = Commit.commit(config, keys, {
		tunnelId: "tun_pairing_slot",
		credentialEnvelope
	});
	assert.equal(result.ok, true);
	assert.equal(result.identitySlot.ok, true);
	assert.equal(Store.read(config).source, "pairing_commit");
	const metadata = Metadata.read(config);
	assert.equal(SecureStore.read(metadata.deviceId, "credential"), credential);
	Forget.forget(config);
	assert.equal(Slots.restore(config).state, "restored");
	const restored = Metadata.read(config);
	assert.equal(SecureStore.read(restored.deviceId, "credential"), credential);
});

test.after(() => fs.rmSync(sandbox, { recursive: true, force: true }));
