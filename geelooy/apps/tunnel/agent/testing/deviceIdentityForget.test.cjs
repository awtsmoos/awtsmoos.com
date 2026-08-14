// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-forget-test-"));
const installRoot = path.join(sandbox, "runtime");
const recoveryRoot = path.join(sandbox, "recovery");
const previousEnvironment = {
	installRoot: process.env.AWTSMOOS_INSTALL_ROOT,
	recoveryRoot: process.env.AWTSMOOS_RECOVERY_ROOT,
	testMode: process.env.AWTSMOOS_TEST_MODE,
	testNamespace: process.env.AWTSMOOS_TEST_NAMESPACE
};
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
process.env.AWTSMOOS_RECOVERY_ROOT = recoveryRoot;
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `forget-${process.pid}`;

const DeviceIdentity = require("../lib/deviceIdentity/index.js");

try {
	const metadata = DeviceIdentity.Metadata.write({ installRoot }, {
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
	assert.equal(DeviceIdentity.load({ installRoot }).ok, true);
	const result = DeviceIdentity.forget({ installRoot });
	assert.equal(result.removed, true);
	assert.equal(DeviceIdentity.publicStatus({ installRoot }).state, "unpaired");
	assert.equal(DeviceIdentity.Metadata.read({ installRoot }), null);
	assert.equal(DeviceIdentity.SecureStore.read(metadata.deviceId, "credential"), null);
	assert.equal(DeviceIdentity.SecureStore.read(metadata.deviceId, "private-key"), null);
	assert.equal(
		DeviceIdentity.Metadata.metadataPath({ root: path.join(sandbox, "project") }),
		path.join(recoveryRoot, "state", "device-binding.json"),
		"project roots must never replace the canonical recovery identity vessel"
	);
	console.log(JSON.stringify({ ok: true, suite: "device-identity-forget" }));
} finally {
	restore("AWTSMOOS_INSTALL_ROOT", previousEnvironment.installRoot);
	restore("AWTSMOOS_RECOVERY_ROOT", previousEnvironment.recoveryRoot);
	restore("AWTSMOOS_TEST_MODE", previousEnvironment.testMode);
	restore("AWTSMOOS_TEST_NAMESPACE", previousEnvironment.testNamespace);
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function restore(name, value) {
	if (value === undefined) delete process.env[name];
	else process.env[name] = value;
}
