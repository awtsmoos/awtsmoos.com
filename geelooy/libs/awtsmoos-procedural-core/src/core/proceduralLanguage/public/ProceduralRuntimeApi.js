//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralRuntimeApi.js
 * @description Exposes explicit resource state, structured logging, and bounded compile-cache control without contaminating deterministic definition identity.
 * The Awtsmoos is beyond cache, logger, network, and runtime state while Awtsmoos.com gives each finite concern an explicit vessel;
 * geometry and semantic truth remain portable even when resources fail, caches clear, or observers change their level.
 */

/** Runtime-only facade over shared cache, resource, and structured logging authorities. */
export class ProceduralRuntimeApi {
	/** @param {{cache: object, resourceRegistry: object, logger: object}} authorities Shared runtime authorities. */
	constructor(authorities) {
		this.cache = authorities.cache;
		this.resources = authorities.resourceRegistry;
		this.logger = authorities.logger;
	}

	/** Returns bounded cache hit, miss, eviction, and entry evidence. */
	cacheStats() {
		return this.cache.stats();
	}

	/** Clears one cache key or all compile artifacts when no key is supplied. */
	clearCache(key) {
		return this.cache.clear(key);
	}

	/** Registers an optional resource descriptor in explicit pending or caller-specified state. */
	resource(input, options = {}) {
		return this.resources.register(input, options);
	}

	/** Marks one resource ready with a runtime-only value. */
	resourceReady(id, value) {
		return this.resources.ready(id, value);
	}

	/** Marks one resource failed and reveals fallback state when configured. */
	resourceFailed(id, error) {
		return this.resources.failed(id, error);
	}

	/** Returns one resource's descriptor, state, value, and error evidence. */
	resourceState(id) {
		return this.resources.get(id);
	}

	/** Returns portable resource lifecycle metadata without runtime resource values. */
	resourceCatalog() {
		return this.resources.describe();
	}
}
