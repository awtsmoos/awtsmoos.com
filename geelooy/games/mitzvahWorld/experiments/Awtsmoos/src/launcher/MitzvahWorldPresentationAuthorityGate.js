// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPresentationAuthorityGate.js
 * @description Waits until the authorities the direct-play presentation declares actually exist.
 * The direct-play presentation hard-requires the runtime bus and the inventory store, and both
 * descend only with post-control hydration. Starting the one-shot direct experience before they
 * land makes its own assertion degrade the player's Bag for the whole session. Observe the living
 * runtime, as the renderer gate observes the renderer; let truth, not timing, open the gate.
 */

const AUTHORITY_LIMIT_MS = 15000;
const AUTHORITY_DISCOVERY_LIMIT_MS = 3000;
const AUTHORITY_POLL_MS = 32;

/**
 * Resolves once the presentation authority is present, terminally absent, or out of time.
 * The wait never blocks play; it only orders the optional direct experience after the
 * post-control hydration that installs the inventory store it asserts.
 * @param {object} diagnostics Staged runtime diagnostics.
 * @param {object} environment Browser-like environment.
 * @param {object} dependencies Optional timing overrides for tests.
 * @returns {Promise<string>} 'authority-ready' or 'authority-unavailable'.
 */
export async function waitForPresentationAuthority(
	diagnostics,
	environment = globalThis,
	dependencies = {}
) {
	const runtime = diagnostics?.runtime;
	if (!runtime) return 'authority-unavailable';
	const limitMs = dependencies.authorityLimitMs ?? AUTHORITY_LIMIT_MS;
	const discoveryMs = dependencies.authorityDiscoveryMs
		?? AUTHORITY_DISCOVERY_LIMIT_MS;
	const pollMs = dependencies.authorityPollMs ?? AUTHORITY_POLL_MS;
	const beganAt = Date.now();
	while (true) {
		if (runtime.bus && runtime.inventoryStore) return 'authority-ready';
		if (diagnostics.postControlHydrationStage === 'degraded') {
			return 'authority-unavailable';
		}
		const elapsed = Date.now() - beganAt;
		if (elapsed >= limitMs) return 'authority-unavailable';
		const postControlSeen = Boolean(
			diagnostics.postControlHydrationPromise
			|| diagnostics.postControlHydrationStage
		);
		if (!postControlSeen && elapsed >= discoveryMs) {
			return 'authority-unavailable';
		}
		if (typeof environment.setTimeout !== 'function') {
			return 'authority-unavailable';
		}
		await new Promise(resolve => environment.setTimeout(resolve, pollMs));
	}
}
