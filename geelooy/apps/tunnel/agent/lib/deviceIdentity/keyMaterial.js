// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Coherence = require("./keyCoherence.js");
const Metadata = require("./metadata.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Generates possession keys and refuses mixed cryptographic generations.
 * The Awtsmoos reveals one public branch only from its own protected hidden root.
 */
function fingerprint(publicKey) {
	return Coherence.fingerprint(publicKey);
}

function wirePublicKey(publicKey) {
	const key = crypto.createPublicKey(String(publicKey || ""));
	const der = key.export({ format: "der", type: "spki" });
	return `rsa-spki-base64url:${der.toString("base64url")}`;
}

function ensure(config = {}) {
	const metadata = Metadata.loadOrCreate(config);
	const privateKey = SecureStore.read(metadata.deviceId, "private-key");
	if (privateKey || metadata.publicKey) {
		const coherent = Coherence.assert(metadata, privateKey);
		const updated = metadata.publicKeyFingerprint === coherent.fingerprint
			? metadata
			: Metadata.update(config, {
				publicKey: coherent.publicKey,
				publicKeyFingerprint: coherent.fingerprint
			});
		return {
			metadata: updated,
			privateKey,
			publicKey: coherent.publicKey,
			fingerprint: coherent.fingerprint
		};
	}
	return generate(config, metadata);
}

function generate(config, metadata) {
	const pair = crypto.generateKeyPairSync("rsa", {
		modulusLength: 3072,
		publicKeyEncoding: { type: "spki", format: "pem" },
		privateKeyEncoding: { type: "pkcs8", format: "pem" }
	});
	SecureStore.write(metadata.deviceId, "private-key", pair.privateKey);
	const keyFingerprint = fingerprint(pair.publicKey);
	const updated = Metadata.update(config, {
		publicKey: pair.publicKey,
		publicKeyFingerprint: keyFingerprint,
		identityGeneration: Number(metadata.identityGeneration || 0) + 1
	});
	return {
		metadata: updated,
		privateKey: pair.privateKey,
		publicKey: pair.publicKey,
		fingerprint: keyFingerprint
	};
}

function decryptCredential(privateKey, envelope) {
	return crypto.privateDecrypt({
		key: privateKey,
		oaepHash: "sha256",
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
	}, Buffer.from(String(envelope || ""), "base64")).toString("utf8");
}

module.exports = { decryptCredential, ensure, fingerprint, generate, wirePublicKey };
