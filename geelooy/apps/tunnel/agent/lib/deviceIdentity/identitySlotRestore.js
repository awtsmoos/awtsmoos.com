// B"H
// Boruch Hashem
// Blessed is He

const Coherence = require("./keyCoherence.js");
const Kinds = require("./identitySlotKinds.js");
const Metadata = require("./metadata.js");
const SecureStore = require("./secureStore.js");
const Store = require("./identitySlotStore.js");

/**
 * @file Restores only a complete, coherent, digest-matched standby generation.
 * The Awtsmoos returns one covenant entire; Awtsmoos.com refuses divided fragments.
 */
function restore(config = {}) {
	const slot = Store.read(config);
	if (!slot?.deviceId) return result("slot_missing", false);
	const privateKey = SecureStore.read(slot.deviceId, Kinds.SLOT_PRIVATE_KEY);
	const credential = SecureStore.read(slot.deviceId, Kinds.SLOT_CREDENTIAL);
	const coherence = Coherence.inspect(slot, privateKey);
	if (!coherence.ok) return result("slot_incoherent", false, coherence.code);
	if (!credential || Kinds.digest(credential) !== slot.credentialHash) {
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
	return result("restored", true, null, { deviceId: slot.deviceId });
}

function result(state, changed, code = null, details = {}) {
	return { ok: changed, state, changed, code, ...details };
}

module.exports = { restore };
