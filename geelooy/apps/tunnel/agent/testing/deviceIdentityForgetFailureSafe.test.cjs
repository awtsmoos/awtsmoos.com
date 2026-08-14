// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-forget-safe-"));
const installRoot = path.join(sandbox, ".awtsmoos-tunnel");
const recoveryRoot = `${installRoot}-recovery`;
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
process.env.AWTSMOOS_RECOVERY_ROOT = recoveryRoot;
fs.mkdirSync(path.join(recoveryRoot, "state"), { recursive: true });
const binding = {
	deviceId: "dev_rejected",
	tunnelId: "tun_rejected",
	credentialVersion: 4
};
fs.mkdirSync(installRoot, { recursive: true });
fs.writeFileSync(path.join(installRoot, "device-binding.json"), JSON.stringify(binding));
fs.writeFileSync(
	path.join(recoveryRoot, "state", "device-binding.json"),
	JSON.stringify(binding)
);

const secureStorePath = require.resolve("../lib/deviceIdentity/secureStore.js");
const forgetPath = require.resolve("../lib/deviceIdentity/forget.js");
const originalSecureStore = require(secureStorePath);
require.cache[secureStorePath].exports = {
	...originalSecureStore,
	remove() {
		const error = new Error("keychain_locked");
		error.code = "KEYCHAIN_LOCKED";
		throw error;
	}
};
delete require.cache[forgetPath];
const Forget = require(forgetPath);
const result = Forget.forget({ installRoot });

assert.equal(result.ok, true);
assert.equal(result.removed, true);
assert.equal(result.secretCleanupComplete, false);
assert.equal(fs.existsSync(path.join(installRoot, "device-binding.json")), false);
assert.equal(
	fs.existsSync(path.join(recoveryRoot, "state", "device-binding.json")),
	false
);
assert.ok(result.failures.some(item => item.code === "KEYCHAIN_LOCKED"));

console.log(JSON.stringify({
	ok: true,
	suite: "device-identity-forget-failure-safe",
	metadataRemovedBeforeSecretCleanup: true,
	recoveryWitnessPurged: true
}, null, 2));
