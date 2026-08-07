// B"H
// Boruch Hashem
// Blessed is He

const Kinds = require("./identitySlotKinds.js");
const Store = require("./identitySlotStore.js");
const Verification = require("./identitySlotVerification.js");

/**
 * @file Recognizes a generation already sealed and verified without rewriting it.
 * The Awtsmoos renews all worlds without waste; Awtsmoos.com preserves one proven seal.
 */
function inspect(config, active) {
	const slot = Store.read(config);
	if (!slot) return mismatch("slot_absent");
	if (slot.deviceId !== active.deviceId) return mismatch("slot_device_changed");
	if (slot.tunnelId !== active.tunnelId) return mismatch("slot_tunnel_changed");
	if (Number(slot.identityGeneration || 0) !== active.identityGeneration) {
		return mismatch("slot_generation_changed");
	}
	if (slot.publicKeyFingerprint !== active.publicKeyFingerprint) {
		return mismatch("slot_fingerprint_changed");
	}
	if (slot.credentialHash !== Kinds.digest(active.credential)) {
		return mismatch("slot_credential_changed");
	}
	const verified = Verification.verify(config, active);
	if (!verified.ok) return mismatch(verified.code || "slot_unverified");
	return {
		ok: true,
		state: "already_captured",
		changed: false,
		slot: verified.slot
	};
}

function mismatch(code) {
	return { ok: false, state: "slot_changed", changed: false, code };
}

module.exports = { inspect };
