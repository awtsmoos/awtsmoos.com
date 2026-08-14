// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-key-coherence-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
process.env.AWTSMOOS_RECOVERY_ROOT = path.join(root, "recovery");
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `coherence-${process.pid}`;

const Coherence = require("../lib/deviceIdentity/keyCoherence.js");
const KeyMaterial = require("../lib/deviceIdentity/keyMaterial.js");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");

function keyPair() {
	return crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { format: "pem", type: "spki" },
		privateKeyEncoding: { format: "pem", type: "pkcs8" }
	});
}

test("matching public and private keys form one coherent identity", () => {
	const pair = keyPair();
	const metadata = {
		deviceId: "dev_matching",
		publicKey: pair.publicKey,
		publicKeyFingerprint: Coherence.fingerprint(pair.publicKey)
	};
	const result = Coherence.inspect(metadata, pair.privateKey);
	assert.equal(result.ok, true);
	assert.equal(result.fingerprint, metadata.publicKeyFingerprint);
});

test("a private key from another generation is rejected before pairing", () => {
	const publicGeneration = keyPair();
	const privateGeneration = keyPair();
	const metadata = Metadata.write({}, {
		deviceId: "dev_mixed_generation",
		publicKey: publicGeneration.publicKey,
		publicKeyFingerprint: Coherence.fingerprint(publicGeneration.publicKey),
		createdAt: new Date().toISOString()
	});
	SecureStore.write(metadata.deviceId, "private-key", privateGeneration.privateKey);
	assert.throws(
		() => KeyMaterial.ensure({ installRoot: root }),
		(error) => error.code === "identity_key_mismatch"
	);
});

test.after(() => fs.rmSync(root, { recursive: true, force: true }));
