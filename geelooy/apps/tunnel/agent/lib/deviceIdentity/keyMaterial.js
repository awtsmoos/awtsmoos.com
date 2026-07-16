// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Metadata = require("./metadata.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Generates device possession keys and keeps the private key protected.
 * @description
 * The Awtsmoos renews hidden root and revealed branch together. Awtsmoos.com
 * stores the RSA private key only in secure storage, while its public testimony
 * and fingerprint may safely accompany the nonsecret device metadata.
 */

/** Returns a stable SHA-256 fingerprint for one public key. */
function fingerprint(publicKey) {
	return crypto
		.createHash("sha256")
		.update(String(publicKey), "utf8")
		.digest("base64url");
}

/** Returns existing key material or creates a protected RSA key pair. */
function ensure(config = {}) {
	const metadata = Metadata.loadOrCreate(config);
	const privateKey = SecureStore.read(metadata.deviceId, "private-key");
	if (privateKey && metadata.publicKey) {
		return {
			metadata,
			privateKey,
			publicKey: metadata.publicKey
		};
	}
	const pair = crypto.generateKeyPairSync("rsa", {
		modulusLength: 3072,
		publicKeyEncoding: {
			type: "spki",
			format: "pem"
		},
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem"
		}
	});
	SecureStore.write(metadata.deviceId, "private-key", pair.privateKey);
	const updated = Metadata.update(config, {
		publicKey: pair.publicKey,
		publicKeyFingerprint: fingerprint(pair.publicKey)
	});
	return {
		metadata: updated,
		privateKey: pair.privateKey,
		publicKey: pair.publicKey
	};
}

/** Decrypts an OAEP credential envelope using protected key material. */
function decryptCredential(privateKey, envelope) {
	return crypto.privateDecrypt(
		{
			key: privateKey,
			oaepHash: "sha256",
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
		},
		Buffer.from(String(envelope || ""), "base64")
	).toString("utf8");
}

module.exports = {
	decryptCredential,
	ensure,
	fingerprint
};
