// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Creation = require("./identityCreationAuthority.js");
const Coherence = require("./keyCoherence.js");
const Metadata = require("./metadata.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Preserves possession keys and allows new-key birth only through explicit authority.
 * @description
 * The Awtsmoos may renew the garment while the hidden key remains the same root;
 * Awtsmoos.com refuses silent replacement, so recovery must restore before creation bears fruit.
 */
function fingerprint(publicKey) {
	return Coherence.fingerprint(publicKey);
}

function wirePublicKey(publicKey) {
	const key = crypto.createPublicKey(String(publicKey || ""));
	const der = key.export({ format: "der", type: "spki" });
	return `rsa-spki-base64url:${der.toString("base64url")}`;
}

/** Reuses coherent key material or delegates new-key creation to the explicit gate. */
function ensure(config = {}) {
	const metadata = Metadata.loadOrCreate(config);
	const privateKey = SecureStore.read(metadata.deviceId, "private-key");
	if (privateKey || metadata.publicKey) return coherentMaterial(config, metadata, privateKey);
	return generate(config, metadata);
}

function coherentMaterial(config, metadata, privateKey) {
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

/** Creates a private/public pair only for a fresh install or explicit operator reset. */
function generate(config = {}, metadata = {}) {
	Creation.assertCreationAllowed(config, "private_key_generate");
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
