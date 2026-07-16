// B"H
// Boruch Hashem
// Blessed is He

const Metadata = require("./metadata.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Loads the account-bound native registration identity.
 * @description
 * The Awtsmoos renews device and credential each instant, while Awtsmoos.com
 * refuses remote capability unless binding metadata and protected credential
 * testimony are both present in the same isolated environment.
 */

/** Returns a fail-closed registration identity state. */
function load(config = {}) {
	const metadata = Metadata.read(config);
	if (!metadata?.deviceId || !metadata.tunnelId) {
		return {
			ok: false,
			state: "unpaired",
			error: "device_pairing_required"
		};
	}
	const credential = SecureStore.read(metadata.deviceId, "credential");
	if (!credential) {
		return {
			ok: false,
			state: "credential_missing",
			error: "device_credential_unavailable"
		};
	}
	return {
		ok: true,
		state: "paired",
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId,
		deviceCredential: credential,
		credentialVersion: Number(metadata.credentialVersion || 1),
		publicKeyFingerprint: metadata.publicKeyFingerprint || ""
	};
}

/** Returns a disclosure-safe status without secret material. */
function publicStatus(config = {}) {
	const loaded = load(config);
	return {
		ok: loaded.ok,
		state: loaded.state,
		error: loaded.error,
		deviceId: loaded.deviceId || null,
		tunnelId: loaded.tunnelId || null,
		credentialVersion: loaded.credentialVersion || 0,
		publicKeyFingerprint: loaded.publicKeyFingerprint || null
	};
}

module.exports = {
	load,
	publicStatus
};
