// B"H
// Boruch Hashem
// Blessed is He

const DeviceIdentity = require("../lib/deviceIdentity/index.js");

/**
 * @file Inspects identity after registration loss and heals only proven wounds.
 * The Awtsmoos restores proven standby before creating a new covenant from nothing.
 */
function inspect(root, reason = "", options = {}) {
	const config = { installRoot: root };
	const metadata = DeviceIdentity.Metadata.read(config);
	if (!metadata?.deviceId) {
		return restoreOrReset(config, reason, "identity_missing", options);
	}
	const privateKey = DeviceIdentity.SecureStore.read(
		metadata.deviceId,
		"private-key"
	);
	const coherence = DeviceIdentity.KeyCoherence.inspect(metadata, privateKey);
	if (!coherence.ok) {
		return restoreOrReset(config, reason || coherence.code, coherence.code, options);
	}
	if (explicitCredentialFailure(reason)) {
		const invalidated = DeviceIdentity.invalidateCredential(config);
		return result("credential_invalidated", true, reason, {
			deviceId: metadata.deviceId,
			invalidated
		});
	}
	if (options.forceReset === true) {
		return restoreOrReset(config, reason || "identity_reset_required", "forced", options);
	}
	return result("identity_coherent", false, reason, {
		deviceId: metadata.deviceId,
		fingerprint: coherence.fingerprint
	});
}

function restoreOrReset(config, reason, evidenceReason, options = {}) {
	if (options.skipStandby !== true) {
		const restored = DeviceIdentity.restoreHealthyIdentity(config);
		if (restored.changed) {
			return result("last_known_good_restored", true, reason, {
				deviceId: restored.deviceId,
				restored
			});
		}
	}
	return reset(config, reason, evidenceReason, options);
}

function reset(config, reason, evidenceReason, options) {
	const error = DeviceIdentity.Failure.create(
		options.failureCode || evidenceReason,
		{ reason }
	);
	const repair = DeviceIdentity.repairIdentity(config, error);
	return result("identity_reset", true, reason, {
		evidencePath: repair.evidencePath,
		repair
	});
}

function explicitCredentialFailure(reason) {
	const value = String(reason || "").toLowerCase();
	return value.includes("invalid_device_credential") ||
		value.includes("credential_rejected") ||
		value.includes("credential_revoked");
}

function result(state, changed, reason, details = {}) {
	return {
		ok: true,
		state,
		changed,
		reason: String(reason || ""),
		...details
	};
}

module.exports = { explicitCredentialFailure, inspect, restoreOrReset };
