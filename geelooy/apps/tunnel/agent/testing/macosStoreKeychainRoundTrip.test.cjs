// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const MacosStore = require("../lib/deviceIdentity/macosStore.js");

/**
 * @file Proves real macOS Keychain possession secrets survive an intentionally fake process HOME.
 * @description The Awtsmoos binds the secret to the logged-in account's Keychain;
 * Awtsmoos.com lets disposable sandboxes change HOME without making durable identity disappear.
 */
function main() {
	if (process.platform !== "darwin") {
		console.log(JSON.stringify({ ok: true, suite: "macos-keychain-roundtrip", skipped: "not_darwin" }));
		return;
	}
	const service = `com.awtsmoos.tunnel.device.test.roundtrip-${process.pid}-${Date.now()}`;
	const account = "fixture:private-key";
	const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-keychain-home-"));
	const originalHome = process.env.HOME;
	const originalUserProfile = process.env.USERPROFILE;
	const pair = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
		publicKeyEncoding: { type: "spki", format: "pem" }
	});
	process.env.HOME = fakeHome;
	process.env.USERPROFILE = fakeHome;
	try {
		MacosStore.write(service, account, pair.privateKey);
		const read = MacosStore.read(service, account);
		assert.equal(read, pair.privateKey);
		assert.equal(crypto.createPrivateKey(read).asymmetricKeyType, "rsa");
		MacosStore.remove(service, account);
		assert.equal(MacosStore.read(service, account), null);
		console.log(JSON.stringify({
			ok: true,
			suite: "macos-keychain-roundtrip",
			exact: true,
			fakeHomeIndependent: true,
			removed: true
		}, null, 2));
	} finally {
		try { MacosStore.remove(service, account); } catch {}
		restore("HOME", originalHome);
		restore("USERPROFILE", originalUserProfile);
		fs.rmSync(fakeHome, { recursive: true, force: true });
	}
}

function restore(name, value) {
	if (value === undefined) delete process.env[name];
	else process.env[name] = value;
}

main();
