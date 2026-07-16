// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-forget-test-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `forget-${process.pid}`;

const DeviceIdentity = require("../lib/deviceIdentity/index.js");
const metadata = DeviceIdentity.Metadata.write({ installRoot: root }, {
	schemaVersion: 1,
	deviceId: "dev_forget_test",
	tunnelId: "tun_forget_test",
	publicKey: "test",
	publicKeyFingerprint: "test",
	pairedAt: new Date().toISOString(),
	credentialVersion: 1,
	createdAt: new Date().toISOString()
});
DeviceIdentity.SecureStore.write(metadata.deviceId, "credential", "credential-test");
DeviceIdentity.SecureStore.write(metadata.deviceId, "private-key", "private-test");
assert.equal(DeviceIdentity.load({ installRoot: root }).ok, true);
const result = DeviceIdentity.forget({ installRoot: root });
assert.equal(result.removed, true);
assert.equal(DeviceIdentity.publicStatus({ installRoot: root }).state, "unpaired");
assert.equal(DeviceIdentity.Metadata.read({ installRoot: root }), null);
assert.equal(DeviceIdentity.SecureStore.read(metadata.deviceId, "credential"), null);
assert.equal(DeviceIdentity.SecureStore.read(metadata.deviceId, "private-key"), null);
delete process.env.AWTSMOOS_INSTALL_ROOT;
assert.equal(
	DeviceIdentity.Metadata.metadataPath({ root: path.join(root, "project") }),
	path.join(root, "device-binding.json"),
	"project roots must never replace the install-root identity vessel"
);
fs.rmSync(root, { recursive: true, force: true });
console.log(JSON.stringify({ ok: true, suite: "device-identity-forget" }));
