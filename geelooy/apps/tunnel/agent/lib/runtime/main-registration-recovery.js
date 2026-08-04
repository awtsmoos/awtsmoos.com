// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resets one rejected device credential without entering a reconnect loop.
 * @description
 * The Awtsmoos removes stale secret material once per unhealthy generation. A second
 * rejection is recorded but cannot repeatedly delete, pair, or spawn; successful
 * registration clears the guard and restores ordinary reconnect behavior.
 */
function recover(dependencies, reason) {
	if (String(reason) !== "invalid_device_credential") return { handled: false };
	if (dependencies.state.credentialRecoveryAttempted === true) {
		return { handled: true, repeated: true, removed: false };
	}
	dependencies.state.credentialRecoveryAttempted = true;
	const config = dependencies.loadConfig();
	const result = dependencies.DeviceIdentity.forget(config);
	dependencies.Receipt?.write("invalid_device_credential_reset", {
		generation: dependencies.state.generation,
		tunnelName: dependencies.state.tunnelName || config.tunnelName || "",
		removed: result.removed === true,
		state: result.state || "unpaired"
	});
	dependencies.log?.("warn",
		"B\"H invalid device credential removed once; reconnecting with fresh identity state.");
	return { handled: true, repeated: false, removed: result.removed === true };
}

function healthy(state) {
	state.credentialRecoveryAttempted = false;
}

module.exports = { healthy, recover };
