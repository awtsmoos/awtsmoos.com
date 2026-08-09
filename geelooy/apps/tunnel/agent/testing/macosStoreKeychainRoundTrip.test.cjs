// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const MacosStore = require("../lib/deviceIdentity/macosStore.js");

/**
 * @file Proves the real macOS Keychain round-trips multiline possession keys exactly.
 * @description
 * The Awtsmoos clothes the secret in one single-line envelope before the `security`
 * CLI can hex-render multiline data. Awtsmoos.com removes the disposable witness in
 * every outcome, leaving the production credential service entirely untouched.
 */
function main() {
	if (process.platform !== "darwin") {
		console.log(JSON.stringify({ ok: true, suite: "macos-keychain-roundtrip", skipped: "not_darwin" }));
		return;
	}
	const service = `com.awtsmoos.tunnel.device.test.roundtrip-${process.pid}-${Date.now()}`;
	const account = "fixture:private-key";
	const pair = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
		publicKeyEncoding: { type: "spki", format: "pem" }
	});
	try {
		MacosStore.write(service, account, pair.privateKey);
		const read = MacosStore.read(service, account);
		assert.equal(read, pair.privateKey);
		const key = crypto.createPrivateKey(read);
		assert.equal(key.asymmetricKeyType, "rsa");
		console.log(JSON.stringify({
			ok: true,
			suite: "macos-keychain-roundtrip",
			exact: true,
			parsed: true
		}, null, 2));
	} finally {
		MacosStore.remove(service, account);
	}
}

main();
