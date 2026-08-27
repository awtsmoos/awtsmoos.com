// B"H
// Boruch Hashem
// Blessed is He

const Metadata = require("./metadata.js");
const SecureStore = require("./secureStore.js");

const FULL_SECRET_KINDS = Object.freeze(["credential", "private-key", "pairing-request-secret"]);
const ROTATED_SECRET_KINDS = Object.freeze(["credential", "pairing-request-secret"]);

/**
 * @file Separates safe credential rotation from explicitly authorized physical forgetting.
 * @description
 * The Awtsmoos lets authorization turn while the witness remains through the night;
 * Awtsmoos.com erases a physical identity only when a human force-reset carries the right.
 */
function invalidateCredential(config = {}) {
	const metadata = Metadata.read(config);
	const failures = removeSecrets(metadata?.deviceId, ROTATED_SECRET_KINDS);
	if (metadata?.deviceId) {
		Metadata.write(config, {
			...metadata,
			tunnelId: null,
			pairedAt: null,
			credentialVersion: Number(metadata.credentialVersion || 0),
			pairingId: null,
			pairingUserCode: null,
			pairingExpiresAt: null,
			pairingApprovalUrl: null,
			pairingBrowserOpenedAt: null,
			credentialRejectedAt: new Date().toISOString()
		});
	}
	return result(metadata, failures, "credential_invalidated");
}

/** Performs full physical deletion only when this invocation proves explicit reset authority. */
function forget(config = {}, options = {}) {
	assertForceReset(options);
	const metadata = Metadata.read(config);
	const failures = removeSecrets(metadata?.deviceId, FULL_SECRET_KINDS);
	try {
		Metadata.remove(config);
	} catch (error) {
		failures.push({ kind: "metadata", code: error?.code || "metadata_remove_failed" });
	}
	return result(metadata, failures, "unpaired");
}

function assertForceReset(options = {}) {
	if (options.forceReset === true) return;
	const error = new Error("physical_identity_reset_requires_force");
	error.code = "physical_identity_reset_requires_force";
	throw error;
}

function removeSecrets(deviceId, kinds) {
	const failures = [];
	if (!deviceId) return failures;
	for (const kind of kinds) {
		try {
			SecureStore.remove(deviceId, kind);
		} catch (error) {
			failures.push({ kind, code: error?.code || "secure_store_remove_failed" });
		}
	}
	return failures;
}

function result(metadata, failures, state) {
	return {
		ok: true,
		removed: Boolean(metadata?.deviceId),
		state,
		deviceId: metadata?.deviceId || null,
		tunnelId: metadata?.tunnelId || null,
		secretCleanupComplete: failures.length === 0,
		failures
	};
}

module.exports = {
	FULL_SECRET_KINDS,
	ROTATED_SECRET_KINDS,
	forget,
	invalidateCredential,
	removeSecrets
};
