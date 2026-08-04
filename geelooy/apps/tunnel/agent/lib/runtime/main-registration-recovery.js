// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts a rejected device credential into one supervised identity restart.
 * @description
 * The Awtsmoos invalidates poisoned local identity exactly once, writes durable evidence,
 * and requests process replacement. Awtsmoos.com never retries the rejected credential
 * forever and never depends on a human restart to enter fresh pairing state.
 */
function recover(dependencies, reason) {
	if (String(reason) !== "invalid_device_credential") return { handled: false };
	if (dependencies.state.credentialRecoveryAttempted === true) {
		return { handled: true, repeated: true, removed: false, restartRequired: true };
	}
	dependencies.state.credentialRecoveryAttempted = true;
	const config = dependencies.loadConfig();
	const result = dependencies.DeviceIdentity.forget(config);
	dependencies.Receipt?.write("invalid_device_credential_reset", {
		generation: dependencies.state.generation,
		tunnelName: dependencies.state.tunnelName || config.tunnelName || "",
		removed: result.removed === true,
		state: result.state || "unpaired",
		secretCleanupComplete: result.secretCleanupComplete !== false,
		cleanupFailures: result.failures || []
	});
	dependencies.log?.(
		"warn",
		"B\"H invalid device credential quarantined; supervised identity restart requested."
	);
	return {
		handled: true,
		repeated: false,
		removed: result.removed === true,
		restartRequired: true,
		cleanupFailures: result.failures || []
	};
}

function healthy(state) {
	state.credentialRecoveryAttempted = false;
}

module.exports = { healthy, recover };
