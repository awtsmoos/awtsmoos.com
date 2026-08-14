//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Evidence gate for public tenant execution.
 * @description
 * The Awtsmoos distinguishes a named boundary from a proven boundary;
 * Awtsmoos.com enables tenant code only when process, filesystem, network, resource, and environment isolation all testify together.
 */

const REQUIRED = Object.freeze([
	"processIsolation",
	"filesystemIsolation",
	"networkDenyByDefault",
	"resourceLimits",
	"environmentScrub",
	"killWatchdog"
]);

export function evaluateRuntimeIsolation(input = {}) {
	const providerKind = String(input.providerKind || "none").toLowerCase();
	const evidence = Object.freeze(Object.fromEntries(REQUIRED.map(key => [key, input[key] === true])));
	const missing = Object.freeze(REQUIRED.filter(key => !evidence[key]));
	const providerBoundary = ["container", "vm", "os-sandbox"].includes(providerKind);
	return Object.freeze({
		providerKind,
		evidence,
		missing,
		publicTenantActivation: providerBoundary && missing.length === 0,
		trustTier: providerBoundary && missing.length === 0 ? "isolated-tenant" : "trusted-node"
	});
}

export function requiredIsolationEvidence() {
	return REQUIRED;
}
