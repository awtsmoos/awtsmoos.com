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

export function installMinimalMeadowFriendlyNpcs(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	if (runtime.friendlyNpcs) {
		return Promise.resolve(runtime.friendlyNpcs.diagnostics?.() || { ready: true });
	}
	// B"H: the hydration backstop and the post-playable priority can both
	// start this install while the other is still loading its GLBs — the
	// `friendlyNpcs` check above only guards sequential calls, so two
	// concurrent installs each create a pair and the meadow ends up with
	// two Mendels standing in one spot. Share one installing promise,
	// set synchronously before the first await, so every concurrent
	// caller waits on the same pair. This stays a plain function (not
	// async) on purpose: an async wrapper would hand each caller a
	// distinct promise, and the shared promise must be reference-identical.
	if (runtime.friendlyNpcsPromise) {
		return runtime.friendlyNpcsPromise;
	}
	const promise = (async () => {
		await runtime.questHydrationPromise?.catch(() => null);
		if (runtime.friendlyNpcs) {
			return runtime.friendlyNpcs.diagnostics?.() || { ready: true };
		}
		const install = dependencies.installMinimalMeadowFriendlyChossids
			|| installMinimalMeadowFriendlyChossids;
		return install(runtime, environment);
	})();
	runtime.friendlyNpcsPromise = promise;
	// B"H: a failed install must not poison later retries — drop the
	// shared promise when it rejects so the next caller starts fresh.
	promise.catch(() => {
		if (runtime.friendlyNpcsPromise === promise) delete runtime.friendlyNpcsPromise;
	});
	return promise;
}

export default installMinimalMeadowFriendlyNpcs;
