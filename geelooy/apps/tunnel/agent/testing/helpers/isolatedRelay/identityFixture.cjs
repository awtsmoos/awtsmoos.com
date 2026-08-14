// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Creates coherent disposable identity generations for isolated agents.
 * @description
 * The Awtsmoos gives every child one fresh secret vessel. Each child may erase its
 * own file without starving the duplicate-process test or touching production Keychain.
 */
function create(installRoot, options = {}) {
	const deviceId = options.deviceId || "dev_isolated_longevity";
	const tunnelId = options.tunnelId || "tun_isolated_longevity";
	const pair = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { format: "pem", type: "spki" },
		privateKeyEncoding: { format: "pem", type: "pkcs8" }
	});
	const metadata = {
		schemaVersion: 1,
		deviceId,
		tunnelId,
		publicKey: pair.publicKey,
		publicKeyFingerprint: fingerprint(pair.publicKey),
		credentialVersion: 1,
		identityGeneration: 1,
		pairedAt: new Date().toISOString(),
		createdAt: new Date().toISOString()
	};
	writeJson(path.join(installRoot, "device-binding.json"), metadata);
	return {
		deviceId,
		metadata,
		secrets: {
			privateKey: pair.privateKey,
			credential: options.credential || "isolated-test-credential"
		},
		tunnelId
	};
}

function writeSecrets(directory, secrets) {
	const file = path.join(
		directory,
		`.identity-fixture-${process.pid}-${crypto.randomBytes(6).toString("hex")}.json`
	);
	writeJson(file, secrets);
	return file;
}

function fingerprint(publicKey) {
	return crypto.createHash("sha256")
		.update(String(publicKey), "utf8")
		.digest("base64url");
}

function writeJson(file, value) {
	fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
	fs.chmodSync(file, 0o600);
}

module.exports = {
	create,
	fingerprint,
	writeJson,
	writeSecrets
};
