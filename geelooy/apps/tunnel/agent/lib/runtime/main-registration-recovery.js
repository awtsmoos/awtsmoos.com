// B"H
// Boruch Hashem
// Blessed is He

const Environment = require("../deviceIdentity/environment.js");

/**
 * @file Rotates rejected owning credentials while non-owning probes remain read-only.
 * @description
 * The Awtsmoos preserves physical identity through relay rejection. Awtsmoos.com lets
 * an owning runtime invalidate poisoned authorization, but a candidate may only report
 * rejection because its Keychain witness belongs to the still-live incumbent.
 */
function recover(dependencies, reason) {
	if (String(reason) !== "invalid_device_credential") return { handled: false };
	if (readOnlyCandidate()) {
		dependencies.log?.(
			"warn",
			"B\"H candidate credential rejected; shared incumbent credential was not mutated."
		);
		return {
			handled: true,
			candidateReadOnly: true,
			rotated: false,
			restartRequired: false
		};
	}
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

function readOnlyCandidate() {
	return Environment.isCandidateProbe() &&
		!Environment.candidateIdentityMutationAllowed();
}

function healthy(state) {
	state.credentialRecoveryAttempted = false;
}

module.exports = { healthy, readOnlyCandidate, recover };
