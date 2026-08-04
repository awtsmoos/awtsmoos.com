// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-rotate-identity-"));
const installRoot = path.join(sandbox, "runtime");
const recoveryRoot = path.join(sandbox, "recovery");
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `rotate-${process.pid}`;
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
process.env.AWTSMOOS_RECOVERY_ROOT = recoveryRoot;

const Identity = require("../lib/deviceIdentity/index.js");
const metadata = Identity.Metadata.write({}, {
	deviceId: "dev_physical",
	tunnelId: "tun_rejected",
	publicKey: "public-key",
	publicKeyFingerprint: "fingerprint",
	pairedAt: "2026-08-04T08:00:00.000Z",
	credentialVersion: 3,
	createdAt: "2026-07-16T17:48:44.391Z"
});
Identity.SecureStore.write(metadata.deviceId, "private-key", "private-key");
Identity.SecureStore.write(metadata.deviceId, "credential", "rejected-secret");
Identity.SecureStore.write(metadata.deviceId, "pairing-request-secret", "pending");
const result = Identity.invalidateCredential({ installRoot });
const after = Identity.Metadata.read({ installRoot });

assert.equal(result.state, "credential_invalidated");
assert.equal(after.deviceId, "dev_physical");
assert.equal(after.publicKeyFingerprint, "fingerprint");
assert.equal(Identity.SecureStore.read(after.deviceId, "private-key"), "private-key");
assert.equal(Identity.SecureStore.read(after.deviceId, "credential"), null);
assert.equal(Identity.SecureStore.read(after.deviceId, "pairing-request-secret"), null);
assert.equal(after.tunnelId, null);

console.log(JSON.stringify({
	ok: true,
	suite: "device-credential-rotation-preserves-identity",
	deviceIdPreserved: true,
	privateKeyPreserved: true
}, null, 2));
