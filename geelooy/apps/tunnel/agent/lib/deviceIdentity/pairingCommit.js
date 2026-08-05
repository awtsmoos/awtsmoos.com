// B"H
// Boruch Hashem
// Blessed is He

const Failure = require("./identityFailure.js");
const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const Pending = require("./pairingPending.js");
const SecureStore = require("./secureStore.js");

/** Commits an approved credential only after local possession decrypts it. */
function commit(config, keys, approved) {
	let credential;
	try {
		credential = KeyMaterial.decryptCredential(
			keys.privateKey,
			approved.credentialEnvelope
		);
	} catch (error) {
		const classified = Failure.classify(error);
		if (!classified.recoverable) throw error;
		throw Failure.create("pairing_credential_decrypt_failed", {
			deviceId: keys.metadata.deviceId,
			expectedFingerprint: keys.fingerprint,
			reason: classified.code
		}, error);
	}
	SecureStore.write(keys.metadata.deviceId, "credential", credential);
	const pending = Metadata.read(config) || {};
	const metadata = Metadata.update(config, {
		tunnelId: approved.tunnelId,
		pairedAt: new Date().toISOString(),
		credentialVersion: Number(keys.metadata.credentialVersion || 0) + 1,
		lastControlOpenedAt: pending.pairingBrowserOpenedAt ||
			pending.lastControlOpenedAt || null,
		lastIdentityRepairAt: pending.lastIdentityRepairAt || null
	});
	Pending.clear(config, keys.metadata.deviceId);
	return {
		ok: true,
		state: "paired",
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId
	};
}

module.exports = { commit };
