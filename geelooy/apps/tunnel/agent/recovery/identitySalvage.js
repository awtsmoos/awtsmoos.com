// B"H
// Boruch Hashem
// Blessed is He

const DeviceIdentity = require("../lib/deviceIdentity/index.js");
const Coherence = require("../lib/deviceIdentity/keyCoherence.js");
const Kinds = require("../lib/deviceIdentity/identitySlotKinds.js");
const Provenance = require("../lib/deviceIdentity/identityProvenance.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");
const Store = require("../lib/deviceIdentity/identitySlotStore.js");

/**
 * @file Inspects and restores the sealed last-known-good identity without a browser.
 * @description
 * The Awtsmoos keeps secret substance in protected storage while Awtsmoos.com keeps
 * only its testimony on disk. Salvage verifies provenance, key coherence, and the
 * credential digest before any restoration, so a fixture can never become rescue.
 */
function inspect(config = {}) {
	const slot = Store.read(config);
	if (!slot?.deviceId || !slot.tunnelId) return failure("identity_slot_missing");
	const provenance = Provenance.inspect(slot);
	if (!provenance.ok) return failure(provenance.reason, { provenance });
	const privateKey = SecureStore.read(slot.deviceId, Kinds.SLOT_PRIVATE_KEY);
	const credential = SecureStore.read(slot.deviceId, Kinds.SLOT_CREDENTIAL);
	const coherence = Coherence.inspect(slot, privateKey);
	if (!coherence.ok) return failure(coherence.code || "identity_slot_key_incoherent", { provenance });
	if (!credential || Kinds.digest(credential) !== slot.credentialHash) {
		return failure("identity_slot_credential_invalid", { provenance });
	}
	return {
		ok: true,
		state: "salvage_ready",
		deviceId: slot.deviceId,
		tunnelId: slot.tunnelId,
		credentialVersion: Number(slot.credentialVersion || 0),
		identityGeneration: Number(slot.identityGeneration || 0),
		capturedAt: slot.capturedAt || null,
		provenance
	};
}

function restore(config = {}) {
	const before = inspect(config);
	if (!before.ok) return before;
	const restored = DeviceIdentity.restoreHealthyIdentity(config);
	const after = DeviceIdentity.publicStatus(config);
	return {
		ok: restored.ok === true && after.ok === true,
		state: restored.ok && after.ok ? "identity_salvaged" : "identity_salvage_failed",
		before,
		restored,
		after
	};
}

function failure(error, details = {}) {
	return { ok: false, state: "salvage_unavailable", error, ...details };
}

module.exports = {
	inspect,
	restore
};
