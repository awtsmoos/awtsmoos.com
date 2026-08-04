// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Rotates one rejected credential without deleting physical-device identity.
 * @description
 * The Awtsmoos preserves device ID, RSA possession key, and public fingerprint.
 * Awtsmoos.com invalidates only rejected authorization, writes durable evidence,
 * and requests one supervised restart into resumable reauthorization state.
 */
function recover(dependencies, reason) {
	if (String(reason) !== "invalid_device_credential") return { handled: false };
	if (dependencies.state.credentialRecoveryAttempted === true) {
		return {
			handled: true,
			repeated: true,
			rotated: false,
			restartRequired: true
		};
	}
	dependencies.state.credentialRecoveryAttempted = true;
	const config = dependencies.loadConfig();
	const result = dependencies.DeviceIdentity.invalidateCredential(config);
	dependencies.Receipt?.write("invalid_device_credential_rotated", {
		generation: dependencies.state.generation,
		tunnelName: dependencies.state.tunnelName || config.tunnelName || "",
		deviceId: result.deviceId,
		state: result.state,
		secretCleanupComplete: result.secretCleanupComplete !== false,
		cleanupFailures: result.failures || []
	});
	dependencies.log?.(
		"warn",
		"B\"H rejected credential rotated; physical device key preserved."
	);
	return {
		handled: true,
		repeated: false,
		rotated: true,
		restartRequired: true,
		deviceId: result.deviceId,
		cleanupFailures: result.failures || []
	};
}

function healthy(state) {
	state.credentialRecoveryAttempted = false;
}

module.exports = { healthy, recover };
