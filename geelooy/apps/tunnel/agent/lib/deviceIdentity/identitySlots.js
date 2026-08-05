// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Identity = require("./identity.js");
const Coherence = require("./keyCoherence.js");
const Metadata = require("./metadata.js");
const SecureStore = require("./secureStore.js");
const Store = require("./identitySlotStore.js");

const SLOT_PRIVATE_KEY = "slot-last-known-good-private-key";
const SLOT_CREDENTIAL = "slot-last-known-good-credential";

/**
 * @file Preserves one complete proven identity generation in Keychain-backed standby.
 * The Awtsmoos remembers a healthy covenant without exposing its hidden substance.
 */
function capture(config = {}, details = {}) {
	const loaded = Identity.load(config);
	const metadata = Metadata.read(config);
	if (!loaded.ok || !metadata?.deviceId) return result("capture_skipped", false);
	const privateKey = SecureStore.read(metadata.deviceId, "private-key");
	const coherence = Coherence.inspect(metadata, privateKey);
	if (!coherence.ok) return result("capture_incoherent", false, coherence);
	SecureStore.write(metadata.deviceId, SLOT_PRIVATE_KEY, privateKey);
	SecureStore.write(metadata.deviceId, SLOT_CREDENTIAL, loaded.deviceCredential);
	const slot = Store.write(config, {
		capturedAt: new Date().toISOString(),
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId,
		publicKey: coherence.publicKey,
		publicKeyFingerprint: coherence.fingerprint,
		credentialHash: digest(loaded.deviceCredential),
		credentialVersion: loaded.credentialVersion,
		identityGeneration: Number(metadata.identityGeneration || 0),
		runtimeVersion: String(details.version || ""),
		registeredPid: Number(details.pid || 0) || null
	});
	return result("captured", true, { slot });
}

function restore(config = {}) {
	const slot = Store.read(config);
	if (!slot?.deviceId) return result("slot_missing", false);
	const privateKey = SecureStore.read(slot.deviceId, SLOT_PRIVATE_KEY);
	const credential = SecureStore.read(slot.deviceId, SLOT_CREDENTIAL);
	const coherence = Coherence.inspect(slot, privateKey);
	if (!coherence.ok) return result("slot_incoherent", false, coherence);
	if (!credential || digest(credential) !== slot.credentialHash) {
		return result("slot_credential_invalid", false);
	}
	SecureStore.write(slot.deviceId, "private-key", privateKey);
	SecureStore.write(slot.deviceId, "credential", credential);
	Metadata.write(config, {
		deviceId: slot.deviceId,
		tunnelId: slot.tunnelId,
		publicKey: coherence.publicKey,
		publicKeyFingerprint: coherence.fingerprint,
		pairedAt: slot.capturedAt,
		credentialVersion: Number(slot.credentialVersion || 1),
		identityGeneration: Number(slot.identityGeneration || 0),
		createdAt: slot.capturedAt,
		restoredFromSlotAt: new Date().toISOString()
	});
	return result("restored", true, { deviceId: slot.deviceId });
}

function digest(value) {
	return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("base64url");
}

function result(state, changed, details = {}) {
	return { ok: true, state, changed, ...details };
}

module.exports = {
	SLOT_CREDENTIAL,
	SLOT_PRIVATE_KEY,
	capture,
	digest,
	restore
};
