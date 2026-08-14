// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Names isolated credential vessels and seals non-owning candidate mutations.
 * @description
 * The Awtsmoos lets a staged probe read the incumbent witness without rewriting it.
 * Awtsmoos.com grants identity creation only through an explicit fresh-install gate.
 */
const PROTECTED_ROOTS = Object.freeze([
	"/Users/awtsmoos/.awtsmoos-tunnel",
	"/Users/awtsmoos/.awtsmoos-tunnel-recovery"
]);
const CANDIDATE_MODE = "candidate-probe";

function isTestMode() {
	return process.env.AWTSMOOS_TEST_MODE === "1";
}

function isCandidateProbe() {
	return process.env.AWTSMOOS_REGISTRATION_MODE === CANDIDATE_MODE;
}

function candidateIdentityMutationAllowed() {
	return !isCandidateProbe() || process.env.AWTSMOOS_CANDIDATE_IDENTITY_MUTATION === "1";
}

function assertIdentityMutationAllowed(operation = "identity_mutation") {
	if (candidateIdentityMutationAllowed()) return true;
	const error = new Error(`candidate_identity_mutation_forbidden:${operation}`);
	error.code = "candidate_identity_mutation_forbidden";
	throw error;
}

function safeFragment(value, fallback) {
	const normalized = String(value || fallback)
		.replace(/[^A-Za-z0-9._-]+/g, "-")
		.slice(0, 80);
	return normalized || fallback;
}

function serviceName() {
	const explicit = process.env.AWTSMOOS_CREDENTIAL_SERVICE;
	if (explicit) {
		const normalized = safeFragment(explicit, "invalid");
		const looksTest = normalized.includes(".test.") || normalized.endsWith(".test");
		if (isTestMode() !== looksTest) {
			throw new Error("credential_service_environment_mismatch");
		}
		return normalized;
	}
	if (!isTestMode()) return "com.awtsmoos.tunnel.device";
	const namespace = safeFragment(
		process.env.AWTSMOOS_TEST_NAMESPACE,
		`pid-${process.pid}`
	);
	return `com.awtsmoos.tunnel.device.test.${namespace}`;
}

function assertSafeInstallRoot(root) {
	const resolved = path.resolve(String(root || ""));
	if (!isTestMode()) return resolved;
	for (const forbidden of PROTECTED_ROOTS) {
		const protectedRoot = path.resolve(forbidden);
		if (resolved === protectedRoot || resolved.startsWith(`${protectedRoot}${path.sep}`)) {
			throw new Error("protected_test_install_root");
		}
	}
	return resolved;
}

module.exports = {
	CANDIDATE_MODE,
	PROTECTED_ROOTS,
	assertIdentityMutationAllowed,
	assertSafeInstallRoot,
	candidateIdentityMutationAllowed,
	isCandidateProbe,
	isTestMode,
	safeFragment,
	serviceName
};
