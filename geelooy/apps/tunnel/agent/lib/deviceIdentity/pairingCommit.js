// B"H
// Boruch Hashem
// Blessed is He

const Capture = require("./identitySlotCapture.js");
const Creation = require("./identityCreationAuthority.js");
const Failure = require("./identityFailure.js");
const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const Pending = require("./pairingPending.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Commits one approved credential and consumes any deliberate reset creation grant.
 * @description
 * The Awtsmoos seals approval, key, and recovery testimony into one enduring sign;
 * Awtsmoos.com spends a reset grant only after successful pairing has made the new witness shine.
 */
function commit(config, keys, approved) {
	const credential = decryptCredential(keys, approved);
	SecureStore.write(keys.metadata.deviceId, "credential", credential);
	const pending = Metadata.read(config) || {};
	const metadata = Metadata.update(config, {
		tunnelId: approved.tunnelId,
		pairedAt: new Date().toISOString(),
		credentialVersion: Number(keys.metadata.credentialVersion || 0) + 1,
		lastControlOpenedAt: pending.pairingBrowserOpenedAt || pending.lastControlOpenedAt || null,
		lastIdentityRepairAt: pending.lastIdentityRepairAt || null
	});
	Pending.clear(config, keys.metadata.deviceId);
	const identitySlot = Capture.capture(config, { source: "pairing_commit" });
	const creationGrantConsumed = Creation.consume(config);
	return {
		ok: true,
		state: "paired",
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId,
		identitySlot,
		creationGrantConsumed
	};
}

function decryptCredential(keys, approved) {
	try {
		return KeyMaterial.decryptCredential(keys.privateKey, approved.credentialEnvelope);
	} catch (error) {
		const classified = Failure.classify(error);
		if (!classified.recoverable) throw error;
		throw Failure.create("pairing_credential_decrypt_failed", {
			deviceId: keys.metadata.deviceId,
			expectedFingerprint: keys.fingerprint,
			reason: classified.code
		}, error);
	}
}

module.exports = { commit };
