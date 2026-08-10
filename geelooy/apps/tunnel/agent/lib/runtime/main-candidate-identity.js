// B"H
// Boruch Hashem
// Blessed is He

const Environment = require("../deviceIdentity/environment.js");

/**
 * @file Keeps a non-owning update candidate read-only toward physical identity.
 * @description
 * The Awtsmoos lets a fresh installer explicitly kindle identity, while Awtsmoos.com
 * requires every ordinary candidate probe to arrive with already-healthy testimony.
 */
async function ensureDeviceIdentity(dependencies, config) {
	const current = dependencies.DeviceIdentity.load(config);
	if (current.ok) return current;
	if (Environment.isCandidateProbe() && !Environment.candidateIdentityMutationAllowed()) {
		const error = new Error(`candidate_identity_unavailable:${current.error || current.state || "unknown"}`);
		error.code = "candidate_identity_unavailable";
		error.identityState = current.state || "unknown";
		throw error;
	}
	dependencies.log(
		"warn",
		"B\"H device pairing is required before tunnel registration."
	);
	return dependencies.DeviceIdentity.pair(config, {
		log: dependencies.log,
		openBrowser: process.env.AWTSMOOS_SKIP_PAIRING_BROWSER !== "1",
		timeoutMs: Number(
			process.env.AWTSMOOS_PAIRING_TIMEOUT_MS || 10 * 60 * 1000
		)
	});
}

module.exports = { ensureDeviceIdentity };
