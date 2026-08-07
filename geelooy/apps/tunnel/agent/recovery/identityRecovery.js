// B"H
// Boruch Hashem
// Blessed is He

const DeviceIdentity = require("../lib/deviceIdentity/index.js");

/**
 * @file Heals identity wounds without letting automatic recovery erase the device.
 * @description
 * The Awtsmoos distinguishes authorization, cryptographic evidence, and permission
 * to destroy a vessel. Awtsmoos.com may restore a verified standby or invalidate a
 * rejected credential automatically; physical reset requires an explicit human gate.
 */
function inspect(root, reason = "", options = {}) {
	const config = { installRoot: root };
	const credentialOnly = explicitCredentialFailure(reason);
	const metadata = DeviceIdentity.Metadata.read(config);
	if (!metadata?.deviceId) {
		return recoveryForMissing(config, reason, "identity_missing", options, credentialOnly);
	}
	const privateKey = DeviceIdentity.SecureStore.read(metadata.deviceId, "private-key");
	const coherence = DeviceIdentity.KeyCoherence.inspect(metadata, privateKey);
	if (!coherence.ok) {
		return recoveryForMissing(config, reason || coherence.code, coherence.code, options, credentialOnly);
	}
	if (credentialOnly) {
		const invalidated = DeviceIdentity.invalidateCredential(config);
		return result("credential_invalidated", true, reason, {
			deviceId: metadata.deviceId,
			fingerprint: coherence.fingerprint,
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

function recoveryForMissing(config, reason, evidenceReason, options, credentialOnly) {
	if (credentialOnly || options.forceReset !== true) {
		return restoreOrRequire(config, reason, evidenceReason);
	}
	return restoreOrReset(config, reason, evidenceReason, options);
}

function restoreOrRequire(config, reason, evidenceReason) {
	const restored = DeviceIdentity.restoreHealthyIdentity(config);
	if (restored.changed) {
		return result("last_known_good_restored", true, reason, {
			deviceId: restored.deviceId,
			restored
		});
	}
	return result("identity_recovery_required", false, reason, {
		evidenceReason,
		restored
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
	if (options.forceReset !== true) {
		return result("identity_recovery_required", false, reason, { evidenceReason });
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

module.exports = {
	explicitCredentialFailure,
	inspect,
	recoveryForMissing,
	restoreOrRequire,
	restoreOrReset
};
