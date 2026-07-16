// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Names isolated credential and metadata vessels for each environment.
 * @description
 * The Awtsmoos renews production and test worlds without confusing their
 * boundaries. Awtsmoos.com refuses protected install roots for candidate tests
 * and gives every disposable run a distinct secure-storage service.
 */

const PROTECTED_ROOTS = Object.freeze([
	"/Users/awtsmoos/.awtsmoos-tunnel",
	"/Users/awtsmoos/.awtsmoos-tunnel-recovery"
]);

/** Returns whether the candidate is explicitly running in isolated test mode. */
function isTestMode() {
	return process.env.AWTSMOOS_TEST_MODE === "1";
}

/** Converts an environment value into a bounded service-name fragment. */
function safeFragment(value, fallback) {
	const normalized = String(value || fallback)
		.replace(/[^A-Za-z0-9._-]+/g, "-")
		.slice(0, 80);
	return normalized || fallback;
}

/** Returns a production-incompatible credential service name for tests. */
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
	if (!isTestMode()) {
		return "com.awtsmoos.tunnel.device";
	}
	const namespace = safeFragment(
		process.env.AWTSMOOS_TEST_NAMESPACE,
		`pid-${process.pid}`
	);
	return `com.awtsmoos.tunnel.device.test.${namespace}`;
}

/** Rejects a test root that enters protected operational infrastructure. */
function assertSafeInstallRoot(root) {
	const resolved = path.resolve(String(root || ""));
	if (!isTestMode()) {
		return resolved;
	}
	for (const forbidden of PROTECTED_ROOTS) {
		const protectedRoot = path.resolve(forbidden);
		if (resolved === protectedRoot || resolved.startsWith(`${protectedRoot}${path.sep}`)) {
			throw new Error("protected_test_install_root");
		}
	}
	return resolved;
}

module.exports = {
	PROTECTED_ROOTS,
	assertSafeInstallRoot,
	isTestMode,
	safeFragment,
	serviceName
};
