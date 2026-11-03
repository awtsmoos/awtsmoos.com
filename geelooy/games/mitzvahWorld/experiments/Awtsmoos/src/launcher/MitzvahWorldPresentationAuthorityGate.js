// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPresentationAuthorityGate.js
 * @description Waits until the authorities the direct-play presentation declares actually exist.
 * The direct-play presentation hard-requires the runtime bus and the inventory store, and both
 * descend only with post-control hydration, which itself starts only when the finished launch
 * publishes playable. Starting the one-shot direct experience before they land makes its own
 * assertion degrade the player's Bag for the whole session. The wait therefore follows the
 * launch's own law: while the launch is in flight it may take the launch's whole hard horizon;
 * once playable is published, the installer has a bounded season to land the store.
 */

const AUTHORITY_LIMIT_MS = 15000;
const LAUNCH_LIMIT_MS = 90000;
const DISCOVERY_LIMIT_MS = 3000;
const AUTHORITY_POLL_MS = 32;

/**
 * Resolves once the presentation authority is present, terminally absent, or out of season.
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
	const launchLimitMs = dependencies.authorityLaunchLimitMs ?? LAUNCH_LIMIT_MS;
	const discoveryMs = dependencies.authorityDiscoveryMs ?? DISCOVERY_LIMIT_MS;
	const pollMs = dependencies.authorityPollMs ?? AUTHORITY_POLL_MS;
	const beganAt = Date.now();
	let playableAt = null;
	while (true) {
		if (runtime.bus && runtime.inventoryStore) return 'authority-ready';
		if (diagnostics.postControlHydrationStage === 'degraded') {
			return 'authority-unavailable';
		}
		const now = Date.now();
		if (playableAt === null && diagnostics.playableEvidence?.ready === true) {
			playableAt = now;
		}
		if (playableAt !== null) {
			if (now - playableAt >= limitMs) return 'authority-unavailable';
		} else if (now - beganAt >= launchLimitMs) {
			return 'authority-unavailable';
		} else if (typeof diagnostics.activatePostPlayable !== 'function'
			&& !diagnostics.postControlHydrationPromise
			&& !diagnostics.postControlHydrationStage
			&& now - beganAt >= discoveryMs) {
			return 'authority-unavailable';
		}
		if (typeof environment.setTimeout !== 'function') {
			return 'authority-unavailable';
		}
		await new Promise(resolve => environment.setTimeout(resolve, pollMs));
	}
}
