// B"H
// Boruch Hashem
// Blessed is He

const Metadata = require("./metadata.js");
const Provenance = require("./identityProvenance.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Loads one account-bound native identity only when provenance and secret agree.
 * @description
 * The Awtsmoos renews device, tunnel, and credential as one truthful covenant.
 * Awtsmoos.com refuses remote capability when metadata is absent, secret custody is
 * missing, or a test/fixture witness tries to cross into the production vessel.
 */
function load(config = {}) {
	const metadata = Metadata.read(config);
	if (!metadata?.deviceId || !metadata.tunnelId) {
		return failure("unpaired", "device_pairing_required");
	}
	const provenance = Provenance.inspect(metadata);
	if (!provenance.ok) {
		return {
			...failure("provenance_rejected", provenance.reason),
			provenance
		};
	}
	const credential = SecureStore.read(metadata.deviceId, "credential");
	if (!credential) {
		return failure("credential_missing", "device_credential_unavailable");
	}
	return {
		ok: true,
		state: "paired",
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId,
		deviceCredential: credential,
		credentialVersion: Number(metadata.credentialVersion || 1),
		publicKeyFingerprint: metadata.publicKeyFingerprint || "",
		provenance
	};
}

function publicStatus(config = {}) {
	const loaded = load(config);
	return {
		ok: loaded.ok,
		state: loaded.state,
		error: loaded.error,
		deviceId: loaded.deviceId || null,
		tunnelId: loaded.tunnelId || null,
		credentialVersion: loaded.credentialVersion || 0,
		publicKeyFingerprint: loaded.publicKeyFingerprint || null,
		provenance: loaded.provenance || null
	};
}

function failure(state, error) {
	return { ok: false, state, error };
}

module.exports = {
	load,
	publicStatus
};
