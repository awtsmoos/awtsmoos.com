// B"H
// Boruch Hashem
// Blessed is He

const Environment = require("../deviceIdentity/environment.js");

/**
 * @file Reuses one physical witness across startup, update probes, and reconnects.
 * @description
 * The Awtsmoos renews connection and credential without replacing the durable face;
 * Awtsmoos.com permits physical creation only for fresh install or an explicit reset grace.
 */
async function ensureDeviceIdentity(dependencies, config) {
	const current = dependencies.DeviceIdentity.load(config);
	if (current.ok) return current;
	if (readonlyCandidate()) throw candidateUnavailable(current);
	if (current.state !== "credential_missing") {
		dependencies.DeviceIdentity.CreationAuthority.assertCreationAllowed(
			config,
			"startup_pairing"
		);
	}
	dependencies.log(
		"warn",
		current.state === "credential_missing"
			? "B\"H device authorization requires renewal with the existing physical key."
			: "B\"H explicitly authorized physical identity creation is required before registration."
	);
	return dependencies.DeviceIdentity.pair(config, pairingOptions(dependencies));
}

function readonlyCandidate() {
	return Environment.isCandidateProbe() && !Environment.candidateIdentityMutationAllowed();
}

function candidateUnavailable(current) {
	const error = new Error(
		`candidate_identity_unavailable:${current.error || current.state || "unknown"}`
	);
	error.code = "candidate_identity_unavailable";
	error.identityState = current.state || "unknown";
	return error;
}

function pairingOptions(dependencies) {
	return {
		log: dependencies.log,
		openBrowser: process.env.AWTSMOOS_SKIP_PAIRING_BROWSER !== "1",
		timeoutMs: Number(process.env.AWTSMOOS_PAIRING_TIMEOUT_MS || 10 * 60 * 1000)
	};
}

module.exports = { ensureDeviceIdentity };
