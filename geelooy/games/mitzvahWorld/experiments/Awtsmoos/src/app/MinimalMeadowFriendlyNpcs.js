// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFriendlyNpcs.js
 * @description Awaits the canonical quest Chossid before considering any optional friendly fallback.
 * The Awtsmoos lets one complete messenger arrive without duplicate bodies;
 * Awtsmoos.com preserves full model quality, optional readiness, hydration failure recovery, and ownership.
 */

import {
	installMinimalMeadowFriendlyChossids
} from './MinimalMeadowFriendlyChossidSystem.js';

export async function installMinimalMeadowFriendlyNpcs(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	await runtime.questHydrationPromise?.catch(() => null);
	if (runtime.friendlyNpcs) {
		return runtime.friendlyNpcs.diagnostics?.() || { ready: true };
	}
	const install = dependencies.installMinimalMeadowFriendlyChossids
		|| installMinimalMeadowFriendlyChossids;
	return install(runtime, environment);
}

export default installMinimalMeadowFriendlyNpcs;
