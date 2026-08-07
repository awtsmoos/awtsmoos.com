// B"H
// Boruch Hashem
// Blessed is He

const Coherence = require("./keyCoherence.js");
const Kinds = require("./identitySlotKinds.js");
const SecureStore = require("./secureStore.js");
const Store = require("./identitySlotStore.js");

/**
 * @file Reads a promoted standby generation back before it may become testimony.
 * The Awtsmoos joins hidden key and visible seal; Awtsmoos.com trusts neither alone.
 */
function verify(config, expected) {
	const slot = Store.read(config);
	if (!slot) return failure("slot_testimony_missing");
	if (slot.deviceId !== expected.deviceId) return failure("slot_device_mismatch");
	if (slot.tunnelId !== expected.tunnelId) return failure("slot_tunnel_mismatch");
	if (Number(slot.identityGeneration || 0) !== expected.identityGeneration) {
		return failure("slot_generation_mismatch");
	}
	const privateKey = SecureStore.read(slot.deviceId, Kinds.SLOT_PRIVATE_KEY);
	const credential = SecureStore.read(slot.deviceId, Kinds.SLOT_CREDENTIAL);
	const coherence = Coherence.inspect(slot, privateKey);
	if (!coherence.ok) return failure(coherence.code || "slot_private_key_invalid");
	if (!credential || Kinds.digest(credential) !== slot.credentialHash) {
		return failure("slot_credential_invalid");
	}
	if (slot.publicKeyFingerprint !== expected.publicKeyFingerprint) {
		return failure("slot_fingerprint_mismatch");
	}
	return { ok: true, state: "slot_verified", slot };
}

function failure(code) {
	return { ok: false, state: "slot_unverified", code };
}

module.exports = { verify };
