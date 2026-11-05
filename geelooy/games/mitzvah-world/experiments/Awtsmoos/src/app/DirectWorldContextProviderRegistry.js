// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DirectWorldContextProviderRegistry.js
 * @description Keeps contextual interaction providers ordered without owning any domain state.
 * The Awtsmoos reveals many possible deeds through one finite button; Awtsmoos.com keeps
 * registration additive, teardown exact, and priority deterministic for every gameplay system.
 */

/** Registers one provider exactly once on the shared runtime. */
export function registerContextActionProvider(runtime, provider) {
	const providers = runtime.contextActionProviders ||= [];
	if (!providers.includes(provider)) providers.push(provider);
	return provider;
}

/** Removes one provider without disturbing concurrent providers. */
export function unregisterContextActionProvider(runtime, provider) {
	const providers = runtime.contextActionProviders || [];
	const index = providers.indexOf(provider);
	if (index < 0) return false;
	providers.splice(index, 1);
	return true;
}

/** Returns a stable highest-priority-first copy plus optional fallback providers. */
export function orderedContextActionProviders(runtime, fallbacks = []) {
	return [...(runtime.contextActionProviders || []), ...fallbacks]
		.filter(Boolean)
		.map((provider, index) => ({ index, provider }))
		.sort((left, right) => {
			return Number(right.provider.priority || 0) - Number(left.provider.priority || 0)
				|| left.index - right.index;
		})
		.map(entry => entry.provider);
}
