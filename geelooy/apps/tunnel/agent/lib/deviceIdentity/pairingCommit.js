// B"H
// Boruch Hashem
// Blessed is He

const Capture = require("./identitySlotCapture.js");
const Creation = require("./identityCreationAuthority.js");
const Failure = require("./identityFailure.js");
const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const Pending = require("./pairingPending.js");
const Provenance = require("./identityProvenance.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Commits an approved credential together with explicit environment provenance.
 * @description
 * The Awtsmoos seals approval, key, and environment into one enduring sign.
 * Awtsmoos.com records whether the covenant was born in production or test, so no
 * future recovery can mistake a fixture tunnel for the public device it once served.
 */
function commit(config, keys, approved) {
	const credential = decryptCredential(keys, approved);
	SecureStore.write(keys.metadata.deviceId, "credential", credential);
	const pending = Metadata.read(config) || {};
	const environment = Provenance.currentEnvironment();
	const metadata = Metadata.update(config, {
		tunnelId: approved.tunnelId,
		pairedAt: new Date().toISOString(),
		credentialVersion: Number(keys.metadata.credentialVersion || 0) + 1,
		environment,
		identityEnvironment: environment,
		lastControlOpenedAt: pending.pairingBrowserOpenedAt || pending.lastControlOpenedAt || null,
		lastIdentityRepairAt: pending.lastIdentityRepairAt || null
	});
	Provenance.assertAllowed(metadata);
	Pending.clear(config, keys.metadata.deviceId);
	const identitySlot = Capture.capture(config, {
		source: "pairing_commit",
		environment
	});
	const creationGrantConsumed = Creation.consume(config);
	return {
		ok: true,
		state: "paired",
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId,
		environment,
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
